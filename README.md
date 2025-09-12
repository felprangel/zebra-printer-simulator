# Simulador de Impressora Zebra com Renderização em Tempo Real

Este projeto é um servidor web que simula o comportamento de uma impressora de etiquetas Zebra. Ele recebe código **ZPL (Zebra Programming Language)**, o renderiza como uma imagem usando a API pública do [Labelary](http://labelary.com/), e exibe a etiqueta em tempo real em uma interface web para todos os clientes conectados.

A principal funcionalidade é a atualização instantânea via **WebSockets**: envie uma requisição `POST` com ZPL a partir de um terminal (usando `curl`, por exemplo), e veja a etiqueta aparecer imediatamente na página web aberta em seu navegador.

O projeto é construído com **Node.js, Express, TypeScript e Socket.IO**.

<img width="1224" height="677" alt="2025-09-11-103621_hyprshot" src="https://github.com/user-attachments/assets/568d7b50-291e-4221-beee-87448c6d6262" />

## ✨ Funcionalidades

- **Endpoint `/pstprnt`**: Simula um servidor de impressão Zebra, recebendo ZPL via `POST`.
- **Interface Web Interativa**: Uma página para colar e testar o código ZPL manualmente.
- **Renderização em Tempo Real**: Requisições feitas via terminal atualizam a interface web instantaneamente para todos os clientes conectados.
- **Log no Console**: Todo ZPL recebido é logado no console do servidor para fins de depuração.
- **Containerizado**: Totalmente configurado para rodar com Docker e Docker Compose, garantindo um setup rápido e consistente.
- **Porta Configurável**: A porta do serviço Docker pode ser facilmente alterada via arquivo `.env`.

## 🚀 Como Executar

Existem duas maneiras de executar o projeto: usando Docker (recomendado) ou manualmente com Node.js.

### Método 1: Usando Docker Compose (Recomendado)

Este é o método mais simples e não requer a instalação do Node.js na sua máquina, apenas o Docker.

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/felprangel/zebra-printer-simulator.git
    cd zebra-printer-simulator
    ```

2.  **Inicie o serviço com Docker Compose:**

    ```bash
    docker-compose up --build -d
    ```

3.  **Acesse a aplicação:**
    Por padrão, o serviço rodará na porta 80. Abra seu navegador e acesse **[http://localhost](http://localhost)**.

#### Customizando a Porta (Opcional)

Se a porta 80 já estiver em uso, você pode alterá-la facilmente:

1.  Crie um arquivo chamado `.env` na raiz do projeto.
2.  Adicione a seguinte linha, substituindo `5001` pela porta desejada:
    ```
    HOST_PORT=5001
    ```
3.  Reinicie o container: `docker-compose up --build -d`.
4.  Agora, acesse a aplicação em `http://localhost:5001`.

### Método 2: Execução Manual

Se preferir rodar o projeto localmente sem Docker, certifique-se de ter o Node.js (v18 ou superior) instalado.

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/felprangel/zebra-printer-simulator.git
    cd zebra-printer-simulator
    ```

2.  **Instale as dependências:**

    ```bash
    pnpm install
    ```

3.  **Inicie o servidor em modo de desenvolvimento:**

    ```bash
    pnpm dev
    ```

4.  **Acesse a aplicação:**
    Neste modo, o servidor rodará na porta 5001. Abra seu navegador e acesse **[http://localhost:5001](https://www.google.com/search?q=http://localhost:5001)**.

## 🛠️ Como Usar

Depois que o servidor estiver rodando, você pode testá-lo de duas formas:

#### 1. Pela Interface Web

- Acesse a URL em que o servidor está rodando (por padrão, **[http://localhost](http://localhost)** com Docker ou **[http://localhost:5001](http://localhost:5001)** manualmente).
- Cole seu código ZPL na área de texto à esquerda.
- Clique no botão "Renderizar (via Web)". A pré-visualização da etiqueta aparecerá à direita.

#### 2. Pelo Terminal (com `curl`)

Esta é a principal funcionalidade. Abra um terminal e envie uma requisição `POST` para o endpoint `/pstprnt`.

```bash
curl -X POST \
     --header "Content-Type: text/plain" \
     --data "^XA^CF0,60^FO50,50^FDEnviado^FS^FO50,130^FDdo Terminal!^FS^XZ" \
     http://localhost/pstprnt
```

_(**Nota**: Se você alterou a porta no Docker ou está executando manualmente, ajuste a URL no comando. Ex: `http://localhost:5001/pstprnt`)_

Imediatamente após executar o comando, a página web aberta em seu navegador será atualizada com a nova etiqueta.

## 🤖 Stack Tecnológica

- **Backend**: Node.js, Express, TypeScript
- **Comunicação Real-time**: Socket.IO
- **Cliente HTTP**: Axios
- **Containerização**: Docker, Docker Compose
- **Ferramentas de Desenvolvimento**: Nodemon, ts-node
