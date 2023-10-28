# API

[Voltar para documentação](README.md)

## Tecnologias utilizadas

- Javascript

- Express.js

## Funcionamento

A API irá servir como backend para as consultas ao site, integrando o banco de dados com a aplicação web em react.

O usuário poderá somente consultar informações a respeito das informações obtidas com os dataloggers.

Ele poderá filtrar essa pesquisa por dia, mês e ano, assim como por datalogger ou local.

## Método de autenticação

O método de autenticação implementado é baseado em Bearer Tokens.

## Endpoints

### /api/v1/metrics

Endpoints para a consulta de métricas registradas pelos dataloggers e dispositivos e armazenadas no banco de dados.

Parâmetros:

- start_datetime=xxxx

- end_datetime=xxxx

- device_serial_number=xxxx

- campus=xxxx

- building=xxxx

- room=xxxx

Exemplo:

- /api/v1/metrics?start_datetime=xxxx&end_datetime=xxxx&device_serial_number=xxxx

- /api/v1/metrics?start_datetime=xxxx&end_datetime=xxxx&device_serial_number[]=xxxx&device_serial_number[]=xxxx  => Multiplos dispositivos

### /api/v1/devices

Endpoint para a consulta de dispositivos disponíveis armazenados no banco de dados.

Parâmetros:

- device_serial_number=xxxx

- campus=xxxx

- building=xxxx

- room=xxxx

### /api/v1/auth/register

### /api/v1/auth/login