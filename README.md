# AR Fazendas — Fazenda Teste 02

Correção da versão anterior: o botão INICIAR TESTE foi colocado em uma camada superior,
com prioridade de toque, e o marcador não pode interceptar eventos de toque.

A Fazenda do Padrinho permanece fixa:
- Latitude: -20.0130583
- Longitude: -45.9368333
- Elevação: 730 m


## Atualização do algoritmo de orientação

Nesta versão o posicionamento horizontal do marcador utiliza o heading derivado do sensor de orientação, comparado ao bearing da Fazenda do Padrinho.

Foram adicionados:
- suavização angular do heading;
- zona morta de 0,8° para reduzir tremulação;
- fator de filtro de 0,08 para reduzir a sensibilidade;
- campo horizontal de 90°;
- tratamento correto da passagem 359° → 0°;
- diagnóstico separado de heading bruto e heading filtrado.

O cálculo de distância e bearing por GPS foi preservado.
O marcador continua sendo apenas visual (`pointer-events: none`) e o botão de início permanece em camada superior.
