# AR Fazendas — Fazenda Teste 02

Versão de teste do marcador AR para a Fazenda do Padrinho.

## Objetivo desta versão

Corrigir o deslocamento lateral indevido causado pela inclinação vertical do telefone e facilitar o alinhamento do marcador no centro da tela.

## Algoritmo de orientação

O heading horizontal é calculado a partir de `alpha`, `beta` e `gamma` com compensação de inclinação. O cálculo projeta a orientação do telefone no plano horizontal, evitando que inclinar o aparelho para cima/baixo seja interpretado como uma mudança lateral.

Foram ajustados:

- compensação de inclinação para separar o eixo horizontal da inclinação vertical;
- suavização angular do heading com fator 0,045;
- zona morta do sensor de 2,5°;
- zona central de alinhamento de ±3°;
- campo horizontal de 120° para reduzir a sensibilidade visual;
- tratamento da passagem 359° → 0°;
- diagnóstico separado de heading compensado bruto e heading filtrado.

## Posicionamento

A posição horizontal do marcador continua sendo calculada pela diferença angular entre:

- bearing GPS até a Fazenda do Padrinho;
- heading horizontal filtrado do telefone.

Dentro da zona central de ±3°, o marcador permanece exatamente em 50% da tela.

## Fazenda do Padrinho

- Latitude: -20.0130583
- Longitude: -45.9368333
- Elevação: 730 m

O cálculo de distância e bearing por GPS foi preservado.

O marcador continua sendo apenas visual (`pointer-events: none`) e o botão de início permanece em camada superior.
