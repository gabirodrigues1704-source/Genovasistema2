import jsPDF from "jspdf";
import JSZip from "jszip";
import { formatCurrency, formatDate, formatMonthYear, getCurrentMonthYear } from "@/lib/utils";
import { numeroParaExtenso } from "@/lib/extenso";

/**
 * === PDF INDIVIDUAL (LAYOUT PROFISSIONAL COM SERVIÇOS EXTRAS) ===
 */
export const generateHonorarioPDF = async (honorario, cliente) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // === Cabeçalho 100% alinhado ===
    const topY = 15;

    try {
        const logo = new Image();
        logo.src = "/logo_honorario.jpg"; // deve estar em /public
        await new Promise((res, rej) => {
            logo.onload = res;
            logo.onerror = rej;
        });
        pdf.addImage(logo, "JPEG", 20, topY, 30, 30);
    } catch {
        console.warn("Logo não encontrada");
    }

    // === Bloco de informações da empresa ===
    const leftTextX = 55;
    const infoTop = topY + 5;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);

    // 🔥 agora, em vez de maxWidth, vamos dividir o nome em duas linhas:
    pdf.text("49.754.763 BRENO VINICIUS DOS SANTOS", leftTextX, infoTop);
    pdf.text("GÊNOVA", leftTextX, infoTop + 5);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Rua Santa Fé do Sul, 2861", leftTextX, infoTop + 11);
    pdf.text("Eldorado", leftTextX, infoTop + 16);
    pdf.text("CEP: 15043060 - SÃO JOSÉ DO RIO PRETO / SP", leftTextX, infoTop + 21);
    pdf.text("Telefone: 1732190612", leftTextX, infoTop + 26);

    const boxWidth = 50; // 🔥 menor largura
    const boxHeight = 27;
    const boxX = pageWidth - boxWidth - 20;
    const boxY = topY + 2; // levemente ajustada verticalmente

    pdf.setDrawColor(0);
    pdf.rect(boxX, boxY, boxWidth, boxHeight);

    // Texto dentro da caixa
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9); // 🔥 reduzido de 10 → 9
    const textX = boxX + 4;
    let textY = boxY + 8;

    pdf.text("EMISSÃO:", textX, textY);
    pdf.text(formatDate(honorario.created_at || new Date()), boxX + boxWidth - 5, textY, { align: "right" });

    textY += 7;
    pdf.text("VENCIMENTO:", textX, textY);
    pdf.text(formatDate(honorario.data_vencimento), boxX + boxWidth - 5, textY, { align: "right" });

    textY += 7;
    pdf.text("NÚMERO:", textX, textY);
    const numeroFatura = `${honorario.mes_referencia.replace("-", "")}0001`;
    pdf.text(numeroFatura, boxX + boxWidth - 5, textY, { align: "right" });

    // === Linha separadora ===
    pdf.line(20, 48, pageWidth - 20, 48);

    // === Título da Fatura ===
    pdf.setFillColor(230, 230, 230);
    pdf.rect(20, 50, pageWidth - 40, 10, "F");
    pdf.setFontSize(12);
    pdf.text("FATURA", pageWidth / 2, 57, { align: "center" });

    // === Dados do Cliente ===
    pdf.setFontSize(10);
    let y = 70;
    pdf.text(`${cliente.nome}`, 22, y);
    y += 5;
    pdf.text(`${cliente.endereco}`, 22, y);
    y += 5;
    pdf.text(`${cliente.cidade} - CEP: ${cliente.cep}`, 22, y);
    y += 5;
    pdf.text(`CPF/CNPJ: ${cliente.cnpj}`, 22, y);
    y += 10;

    // === Cabeçalho da Tabela ===
    pdf.setFont("helvetica", "bold");
    pdf.rect(20, y, pageWidth - 40, 8);
    pdf.text("DESCRIÇÃO", 22, y + 6);
    pdf.text("EMISSÃO", pageWidth - 75, y + 6);
    pdf.text("VALOR", pageWidth - 35, y + 6);
    y += 8;

    // === Linha principal: Honorário mensal ===
    pdf.setFont("helvetica", "normal");
    pdf.rect(20, y, pageWidth - 40, 8);
    pdf.text(`HONORÁRIOS CONTÁBEIS REF: ${formatMonthYear(honorario.mes_referencia)}`, 22, y + 6);
    pdf.text(formatDate(honorario.created_at || new Date()), pageWidth - 75, y + 6);
    pdf.text(formatCurrency(honorario.valor_base), pageWidth - 35, y + 6);
    y += 8;

    // === Serviços Extras ===
    if (honorario.servicos_extras && honorario.servicos_extras.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.text("SERVIÇOS EXTRAS:", 22, y + 6);
        y += 10;
        pdf.setFont("helvetica", "normal");

        honorario.servicos_extras.forEach((servico) => {
            pdf.rect(20, y, pageWidth - 40, 8);
            pdf.text(`• ${servico.descricao}`, 22, y + 6);
            pdf.text(formatDate(servico.data), pageWidth - 75, y + 6);
            pdf.text(formatCurrency(servico.valor), pageWidth - 35, y + 6);
            y += 8;
        });
    }

    // === Valor Extenso e Total ===
    y += 10;
    pdf.setFont("helvetica", "normal");
    pdf.text("A importância de:", 22, y);
    const extenso = numeroParaExtenso(honorario.valor_total);
    pdf.setFont("helvetica", "bold");
    pdf.text(extenso.toUpperCase(), 22, y + 5);

    pdf.setFont("helvetica", "bold");
    pdf.rect(pageWidth - 60, y - 3, 40, 15);
    pdf.setFontSize(12);
    pdf.text(formatCurrency(honorario.valor_total), pageWidth - 40, y + 7, { align: "center" });

    // === Bloco PIX ===
    y += 30;
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(20, y, pageWidth - 40, 60);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("PAGAMENTO VIA PIX", 25, y + 8);
    pdf.setDrawColor(212, 175, 55);
    pdf.line(25, y + 10, pageWidth - 45, y + 10);

    try {
        const qr = new Image();
        qr.src = "/qrcode.jpeg";
        await new Promise((res, rej) => {
            qr.onload = res;
            qr.onerror = rej;
        });
        pdf.addImage(qr, "JPEG", 25, y + 15, 40, 40);
    } catch {
        console.warn("QR code não encontrado");
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Favorecido:", 70, y + 20);
    pdf.text("BRENO VINICIUS DOS SANTOS GÊNOVA", 95, y + 20);
    pdf.text("Chave PIX (CNPJ):", 70, y + 27);
    pdf.setFont("helvetica", "bold");
    pdf.text("49.754.763/0001-17", 110, y + 27);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Como pagar:", 70, y + 35);
    pdf.text("1. Abra o app do seu banco", 70, y + 40);
    pdf.text("2. Escolha Pix > Ler QR Code", 70, y + 45);
    pdf.text("3. Aponte a câmera para o código ao lado", 70, y + 50);
    pdf.text("4. Confirme o valor e finalize o pagamento", 70, y + 55);

    // // === Rodapé ===
    // pdf.setFont("helvetica", "italic");
    // pdf.setFontSize(9);
    // pdf.setTextColor(100, 100, 100);
    // pdf.text("Gênova Contabilidade - www.genovacont.com.br", pageWidth / 2, 285, { align: "center" });

    const fileName = `Fatura_${cliente.nome.replace(/\s+/g, "_")}_${honorario.mes_referencia}.pdf`;
    pdf.save(fileName);
    return { pdf, fileName };
};

/**
 * === GERAÇÃO EM LOTE (ZIP) ===
 */
export const generateBatchPDFs = async (honorarios, clientes) => {
    const zip = new JSZip();

    for (const honorario of honorarios) {
        const cliente = clientes.find((c) => c.id === honorario.cliente_id);
        if (!cliente) continue;

        const { pdf, fileName } = await generateHonorarioPDF(honorario, cliente);
        const pdfBlob = pdf.output("blob");
        zip.file(fileName, pdfBlob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `Honorarios_${getCurrentMonthYear()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};
