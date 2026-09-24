# AR Fazendas — Fazenda Teste 01

Versão de teste controlado com uma única fazenda fixa:

- Fazenda do Padrinho
- Latitude: -20.0130583
- Longitude: -45.9368333
- Elevação: 730 m

Objetivo: validar GPS + orientação + cálculo de bearing/distância + posição horizontal do marcador.

Ainda não usa GeoJSON.

## Teste

1. Publique no GitHub Pages.
2. Abra no Chrome do celular via HTTPS.
3. Toque em INICIAR TESTE.
4. Autorize câmera e localização.
5. Gire lentamente o celular.
6. Observe `Bearing até a fazenda`, `Heading do celular` e `Diferença angular`.
7. O marcador deve se mover horizontalmente conforme o celular gira.

Observação: a projeção atual usa FOV horizontal aproximado de 70° apenas para validar a lógica. Ainda não é a calibração AR final.
