# BV Chatbot - Página inicial e chatbot

| **master** | [![Build Status](https://travis-ci.org/IBM-Bluemix/insurance-bot.svg?branch=master)](https://travis-ci.org/IBM-Bluemix/insurance-bot) |
| ----- | ----- |
| **dev** | [![Build Status](https://travis-ci.org/IBM-Bluemix/insurance-bot.svg?branch=dev)](https://travis-ci.org/IBM-Bluemix/insurance-bot) |

Esse repositório é parte do projeto maior [BV Chatbot](https://github.com/IBM-Bluemix/cloudco-insurance).

# Visão Geral

[![Policy Bot](./design/video-cap.png)](https://vimeo.com/165460548 "Policy Bot Concept - Click to Watch!")

Para enviar todo o conjunto de microsserviços envolvidos confira o [repositório da toolchain do seguro][toolchain_url].
Ou se preferir, pode enviar apenas a aplicação seguindo os passos abaixo.

## Rodando a aplicação no Bluemix

1. Caso não tenha uma conta no Bluemix [inscreva-se][bluemix_reg_url]

1. Baixe e Instale a ferramenta [Cloud Foundry CLI][cloud_foundry_url].

1. O app depende dos microsserviços de [Catálogo](https://github.com/carlosbu/insurance-catalog) e [Demandas](https://github.com/carlosbu/insurance-orders). Certifique-se de enviá-los ao Bluemix primeiro.

1. Clone a aplicação para seu ambiente de trabalho pelo terminal de comandos usando o seguinte comando:

  ```
  git clone https://github.com/carlosbu/insurance-bot.git
  ```

1. `cd` insira-seu-diretório

1. Abra o arquivo `manifest.yml` e mude o valor `host` para um nome único.

  Seu host criado definirá o subdomínio da URL de sua aplicação:  `<host>.mybluemix.net`

1. Conecte a aplicação no terminal de comandos e siga os comandos a seguir para logar:

  ```
  cf login -a https://api.ng.bluemix.net
  ```

1. Crie um serviço cloudant no Bluemix

  ```
  cf create-service cloudantNoSQLDB Lite insurance-bot-db
  ```

1. Crie um serviço de conversation no Bluemix

  ```
  cf create-service conversation standard insurance-bot-conversation
  ```

1. Envie o app para o Bluemix

  ```
  cf push --no-start
  ```

1. Defina uma variável apontando o envio para a API do catálogo.

  ```
  cf set-env insurance-bot CATALOG_URL https://your-insurance-catalog.mybluemix.net
  ```

1. Defina uma variável apontando o envio para a API das demandas.

  ```
  cf set-env insurance-bot ORDERS_URL https://your-insurance-orders.mybluemix.net
  ```

1. Inicie seu app

  ```
  cf start insurance-bot
  ```

E voila! Você tem sua própria versão do app rodando no Bluemix.

## Executando o app em host local

1. Caso não tenha uma conta no Bluemix [inscreva-se][bluemix_reg_url]

1. Caso ainda não tenha baixado o node [clique aqui para baixar][download_node_url] e instalar em sua máquina.

1. O app depende dos microsserviços de [Catálogo](https://github.com/carlosbu/insurance-catalog) e [Demandas](https://github.com/carlosbu/insurance-orders). Certifique-se de enviá-los ao Bluemix primeiro.

1. Crie um serviço cloudant no Bluemix

  ```
  cf create-service cloudantNoSQLDB Lite insurance-bot-db
  ```

1. Crie um serviço de conversation no Bluemix

  ```
  cf create-service conversation standard insurance-bot-conversation
  ```

1. No diretório de checkout copie o arquivo ```vcap-local.template.json``` para ```vcap-local.json```. Edite ```vcap-local.json``` e atualize as crendeciais dos serviços de Cloudant e de Conversation. Você pode obter as credenciais do serviço direto do console do Bluemix.

  ```
  cp vcap-local.template.json vcap-local.json
  ```

1. No diretório de checkou copie o arquivo ```.template.env``` para ```.env```. Edite ```.env``` e atualize as crendeciais dos serviços de Cloudant e de Conversation. Refira-se a [este passo](#importWorkspace) para receber uma id de workspace.

  ```
  cp .template.env .env
  ```

1. Instalar

  ```
  npm install
  ```

1. Executar

  ```
  npm start
  ```

## Contribua

Se você encontrar um bug, favor reportar via [Seção de error][issues_url] ou melhor, arrume o projeto e envie um requerimento de envio de sua solução! Estamos mais que felizes em aceitar contribuições externas para esse projeto caso elas enderecem uma nota de um problema existente.  
Para ser considerado, o requerimento deve passar pela compilação inicial do [Travis CI][travis_url] e/ou adicionar valor substancial para a aplicação modelo.

## Solução de problemas

A fonte primária de informação para solução de erros do seu aplicativo Bluemix são os logs. Para vê-los, execute os seguintes comandos no Cloud Foundry CLI:

  ```
  $ cf logs insurance-bot --recent
  ```

Para informações mais detalhadas em debugar sua aplicação veja a [Seção de solução de problemas](https://www.ng.bluemix.net/docs/troubleshoot/tr.html) na documentação do Bluemix.

## Licença

Veja o [arquivo de licença](License.txt) para informação sobre a licença.

# Notificação de privacidade

Essa aplicação é configurada para rastrear seus envios para o [IBM Bluemix](http://www.ibm.com/cloud-computing/bluemix/) e outras plataformas cloud foundry. A informação a seguir é enviada para um [Rastreador de envio](https://github.com/IBM-Bluemix/cf-deployment-tracker-service) a cada envio:

* Versão do pacote Node.js
* URL do repositório Node.js
* Nome do app (`application_name`)
* ID do espaço (`space_id`)
* Versão do app (`application_version`)
* URIs do app (`application_uris`)
* Rótulos de serviços associados
* Número de instância para cada serviço associado e informações do plano associadas

Os dados coletados do arquivo `package.json` na aplicação e as variáveis do ambiente `VCAP_APPLICATION` e `VCAP_SERVICES` no Bluemix e outras plataformas Cloud Foundry. Esses dados são utilizados pela IBM para traçar medidos ao redor dos envios de aplicações modelo para o Bluemix para medir a utilidade dos exemplos, para que possamos sempre melhor o conteúdo que lhe oferecemos. Somente envios de aplicações modelo incluem código que importa o rastreador de envio serão rastreados.

## Desabilitando o rastreador de envio

O rastreador de envio pode ser removido deletando a linha `require("cf-deployment-tracker-client").track();` do início do arquivo `app.js`.

[toolchain_url]: https://github.com/carlosbu/insurance-toolchain
[bluemix_reg_url]: http://ibm.biz/insurance-store-registration
[cloud_foundry_url]: https://github.com/cloudfoundry/cli
[download_node_url]: https://nodejs.org/download/
[issues_url]: https://github.com/carlosbu/insurance-bot/issues
[travis_url]: https://travis-ci.org/
