# GreenYellow Metrics Hub - README

## Descrição do Projeto
O GreenYellow Metrics Hub é um sistema desenvolvido com NestJS para importação, agregação e geração de relatórios de métricas a partir de arquivos CSV.
Este projeto realiza o processamento de dados, armazena em um banco PostgreSQL e permite a exportação de relatórios em formato Excel.

---

## Estrutura do Projeto

- **/src/metric** - Contém os arquivos principais do serviço de métricas.
- **/reports** - Pasta onde os relatórios gerados serão armazenados.
- **/uploads** - Pasta temporária para upload de arquivos CSV.
- **/config** - Configurações gerais da aplicação.

---

## Requisitos

- Node.js (v16+)
- PostgreSQL (v13+)
- NestJS (v9+)
- Docker (opcional)
- npm ou yarn

---

## Configuração do Banco de Dados

### Criar o Banco de Dados PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE greenyellow_db;
```
---

### Criar Usuário e Conceder Permissões
```bash
CREATE USER greenyellow_user WITH ENCRYPTED PASSWORD 'strongpassword';
GRANT ALL PRIVILEGES ON DATABASE greenyellow_db TO greenyellow_user;
```
---

### Criar Tabela de Métricas
```bash
\c greenyellow_db
CREATE TABLE metric (
id SERIAL PRIMARY KEY,
metricId INT NOT NULL,
dateTime TIMESTAMP NOT NULL,
aggDay INT NOT NULL,
aggMonth INT NOT NULL,
aggYear INT NOT NULL
);
```
---

## Instalação e Configuração

### Clonar o Repositório
```bash
git clone https://github.com/SuperMendes/greenyellow-metrics-hub.git
cd greenyellow-metrics-hub
```
---

### Instalar Dependências
```bash
npm install
```
---

### Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes configurações:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=greenyellow_user
DB_PASS=strongpassword
DB_NAME=greenyellow_db
```
---

## Executar Migrações
```bash
npm run migration:run
```
---

## Executando o Projeto

### Modo Desenvolvimento
```bash
npm run start:dev
```
### Modo Produção
```bash
npm run start:prod
```
---

## Importação de Arquivos CSV
Coloque o arquivo `METRICS_IMPORT.csv` na pasta `/import`.
Execute o seguinte comando:
```bash
curl -X POST -F "file=@/caminho/para/METRICS_IMPORT.csv" http://localhost:3000/metrics/import
```
---

## Geração de Relatórios Excel
Gere um relatório executando:
```bash
curl -X GET "http://localhost:3000/metrics/report?metricId=71412&dateInitial=2023-11-01&finalDate=2023-11-30" --output relatorio.xlsx
```
O arquivo será salvo na pasta `/reports` e baixado automaticamente.

---

## Endpoints da API

1. **Importar Métricas**
POST /metrics/import
Descrição: Importa dados de um arquivo CSV.
Entrada: Arquivo CSV.
Saída: Confirmação da importação.

---

2. **Obter Métricas Agregadas**
GET /metrics/aggregate
Descrição: Retorna dados agregados por dia, mês ou ano.
Parâmetros:
- metricId: ID da métrica.
- aggType: Tipo de agregação (DAY, MONTH, YEAR).
- dateInitial: Data inicial (YYYY-MM-DD).
- finalDate: Data final (YYYY-MM-DD).

---

3. **Gerar Relatório Excel**
GET /metrics/report
Descrição: Gera um relatório Excel com dados agregados.
Parâmetros:
- metricId: ID da métrica.
- dateInitial: Data inicial (YYYY-MM-DD).
- finalDate: Data final (YYYY-MM-DD).
Saída: Arquivo Excel salvo em `/reports`.

---

## Estrutura das Pastas

```bash
greenyellow-metrics-hub/
├── src/
│   ├── metric/
│   │   ├── metric.controller.ts
│   │   ├── metric.service.ts
│   │   ├── metric.entity.ts
│   │   └── dto/
│   │       └── get-aggregation.dto.ts
│   └── config/
│       └── database.config.ts
├── reports/   # Relatórios Excel gerados
├── import/    # Arquivos CSV para importação
├── uploads/   # Uploads temporários
└── README.txt

```


## Testes

### Executar Testes Unitários
npm run test

---

### Executar Testes e2e (End-to-End)
npm run test:e2e

---

### Ver Cobertura de Testes
npm run test:cov

---

## Docker (Opcional)

Para rodar o PostgreSQL em um container Docker:
docker-compose up -d

---

## Considerações Finais
Este projeto foi desenvolvido utilizando NestJS e PostgreSQL. O código segue boas práticas de desenvolvimento, incluindo validação de dados, logging e controle de erros.
Para dúvidas, entre em contato pelo GitHub ou email.

Autor: Bruno Mendes de Oliveira Ferreira
E-mail: bruno_mds_@hotmail.com

>>>>>>> 2c08c0a (Corrigido repositório interno duplicado)
