import React from 'react';
export const numeroParaExtenso = (numero) => {
    if (numero === 0) return 'zero';

    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    const converterGrupo = (n) => {
        if (n === 0) return '';
        if (n === 100) return 'cem';

        let resultado = '';
        const c = Math.floor(n / 100);
        const d = Math.floor((n % 100) / 10);
        const u = n % 10;

        if (c > 0) resultado += centenas[c];

        if (d === 1) {
            if (resultado) resultado += ' e ';
            resultado += especiais[u];
            return resultado;
        }

        if (d > 1) {
            if (resultado) resultado += ' e ';
            resultado += dezenas[d];
        }

        if (u > 0) {
            if (resultado && d !== 1) resultado += ' e ';
            resultado += unidades[u];
        }

        return resultado;
    };

    let parteInteira = Math.floor(numero); // Changed to let
    const parteDecimal = Math.round((numero - parteInteira) * 100);

    let extenso = '';

    if (parteInteira >= 1000000) {
        const milhoes = Math.floor(parteInteira / 1000000);
        extenso += converterGrupo(milhoes) + (milhoes === 1 ? ' milhão' : ' milhões');
        parteInteira %= 1000000;
        if (parteInteira > 0) extenso += ' e ';
    }

    if (parteInteira >= 1000) {
        const milhares = Math.floor(parteInteira / 1000);
        extenso += converterGrupo(milhares) + ' mil';
        parteInteira %= 1000;
        if (parteInteira > 0) extenso += ' e ';
    }

    if (parteInteira > 0) {
        extenso += converterGrupo(parteInteira);
    }

    extenso += parteInteira === 1 ? ' real' : ' reais';

    if (parteDecimal > 0) {
        extenso += ' e ' + converterGrupo(parteDecimal);
        extenso += parteDecimal === 1 ? ' centavo' : ' centavos';
    }

    return extenso;
};