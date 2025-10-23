import jsPDF from 'jspdf';
import { formatCurrency, formatDate, formatMonthYear, getCurrentMonthYear } from '@/lib/utils';
import { numeroParaExtenso } from '@/lib/extenso';
import JSZip from 'jszip';

export const generateHonorarioPDF = async (honorario, cliente) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Header
    pdf.setFillColor(212, 175, 55);
    pdf.rect(0, 0, pageWidth, 20, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GÊNOVA CONTABILIDADE', pageWidth / 2, 12, { align: 'center' });

    // Title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECIBO DE HONORÁRIOS CONTÁBEIS', pageWidth / 2, 35, { align: 'center' });

    // Info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 15, 45);
    pdf.text(`Referência: ${formatMonthYear(honorario.mes_referencia)}`, pageWidth - 15, 45, { align: 'right' });

    pdf.setDrawColor(224, 224, 224);
    pdf.line(15, 50, pageWidth - 15, 50);

    // Client Data
    let yPos = 58;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DADOS DO CLIENTE', 15, yPos);
    yPos += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nome/Razão Social: ${cliente.nome}`, 15, yPos);
    yPos += 6;
    pdf.text(`CNPJ: ${cliente.cnpj}`, 15, yPos);
    yPos += 6;
    pdf.text(`Endereço: ${cliente.endereco}, ${cliente.cidade} - ${cliente.cep}`, 15, yPos);
    yPos += 10;

    pdf.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;

    // Services
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DISCRIMINAÇÃO DOS SERVIÇOS', 15, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Honorários Mensais', 15, yPos);
    pdf.text(formatCurrency(honorario.valor_base), pageWidth - 15, yPos, { align: 'right' });
    yPos += 7;

    if (honorario.servicos_extras && honorario.servicos_extras.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Serviços Extras:', 15, yPos);
        yPos += 6;
        pdf.setFont('helvetica', 'normal');

        honorario.servicos_extras.forEach(servico => {
            pdf.text(`• ${servico.descricao} (${formatDate(servico.data)})`, 20, yPos);
            pdf.text(formatCurrency(servico.valor), pageWidth - 15, yPos, { align: 'right' });
            yPos += 6;
        });
    }

    yPos += 4;
    pdf.line(15, yPos, pageWidth - 15, yPos);
    yPos += 10;

    // Total
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(212, 175, 55);
    pdf.text('VALOR TOTAL:', 15, yPos);
    pdf.text(formatCurrency(honorario.valor_total), pageWidth - 15, yPos, { align: 'right' });
    yPos += 7;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    const extenso = numeroParaExtenso(honorario.valor_total);
    pdf.text(`(${extenso.charAt(0).toUpperCase() + extenso.slice(1)})`, 15, yPos, { maxWidth: pageWidth - 30 });
    yPos += 12;

    pdf.setTextColor(0, 0, 0);
    pdf.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;

    // Payment Info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Vencimento: ${formatDate(honorario.data_vencimento)}`, 15, yPos);
    yPos += 6;

    if (honorario.status === 'pago' && honorario.data_pagamento) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 128, 0);
        pdf.text(`✓ PAGO EM ${formatDate(honorario.data_pagamento)}`, 15, yPos);
        pdf.setTextColor(0, 0, 0);
        yPos += 6;
    }

    if (honorario.observacoes) {
        yPos += 4;
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Observações: ${honorario.observacoes}`, 15, yPos);
    }

    // Footer
    yPos = pageHeight - 50;
    pdf.line(15, yPos, pageWidth - 15, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DADOS PARA PAGAMENTO', 15, yPos);
    yPos += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.text('PIX (CNPJ): 00.000.000/0001-00', 15, yPos);
    yPos += 6;
    pdf.text('Banco: Banco Fictício S.A. (000)', 15, yPos);
    yPos += 6;
    pdf.text('Agência: 0001 | Conta Corrente: 12345-6', 15, yPos);

    const qrCodeData = '00020126360014BR.GOV.BCB.PIX0114000000000001005204000053039865802BR5925GÊNOVA CONTABILIDADE6009SAO PAULO62070503***6304E3E5';

    try {
        const qrcodeImg = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = '/qrcode.jpeg'; // Assuming qrcode.jpeg is in public folder
        });
        pdf.addImage(qrcodeImg, 'JPEG', pageWidth - 55, yPos - 25, 40, 40);
    } catch (e) {
        console.error("Could not load QR code image for PDF.");
    }

    const fileName = `Honorario_${cliente.nome.replace(/\s+/g, '_')}_${honorario.mes_referencia}.pdf`;

    return { pdf, fileName };
};

export const generateBatchPDFs = async (honorarios, clientes) => {
    const zip = new JSZip();

    for (const honorario of honorarios) {
        const cliente = clientes.find(c => c.id === honorario.cliente_id);
        if (!cliente) continue;

        const { pdf, fileName } = await generateHonorarioPDF(honorario, cliente);
        const pdfBlob = pdf.output('blob');
        zip.file(fileName, pdfBlob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `Honorarios_${getCurrentMonthYear()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};