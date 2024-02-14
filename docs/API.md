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

O método de autenticação implementado é baseado em Bearer Tokens por meio do cabeçalho _Authentication_.

## Pontos de acesso

### GET /api/v1/metrics /api/v1/metrics/<serial_number> /api/v1/metrics/<campus>/<building>/<room>

Endpoints para a consulta de métricas registradas pelos dispositivos e armazenadas no banco de dados. A consulta pode ser filtrada tanto pelo número de série do dispositivo quanto pelo local colocando o campus, o prédio e a sala.

Parâmetros:

- start_datetime=xxxx

- end_datetime=xxxx

Autenticação (via cabeçalho `Authentication`) necessária!

### POST /api/v1/metrics

Endpoint para inserção de dados no bancod de dados. O conteúdo do corpo deve ser o seguinte:

```json
{
  "date":<date>,
  "device":<serial_number>,
  "metrics": {
    "temperature":<temperature>,
    ...
  }
}
```

Autenticação (via cabeçalho `Authentication`) necessária!

### GET /api/v1/devices /api/v1/devices/<serial_number> /api/v1/devices/<campus>/<building>/<room>

Endpoints para a consulta de dispositivos disponíveis armazenados no banco de dados.

Autenticação (via cabeçalho `Authentication`) necessária!

### POST /api/v1/devices

Endpoint para o cadastro de dispositivos no banco de dados. O conteúdo do corpo deve ser o seguinte:

```json
{
  "device":<serial_number>,
  "campus":<campus>,
  "building":<building>,
  "room":<room>,
  "description":<description>
}
```

Autenticação (via cabeçalho `Authentication`) necessária!

### POST /api/v1/auth/register

### POST /api/v1/auth/login

Endpoint para 
