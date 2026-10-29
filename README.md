# Farmácia Sambati — site institucional

Site oficial da **Farmácia Sambati** (R M Sambati Ltda — CNPJ 03.529.639/0001-57), drogaria na
Rua Reinaldo Massi, 1333 – Jardim Novo Horizonte, Rolândia – PR.

- Endereço público: <https://farmaciasambati.site>
- Hospedagem: GitHub Pages (gratuito), publicado direto da branch `main`, pasta raiz.
- Tecnologia: HTML, CSS e JavaScript puros. Não há processo de build, banco de dados nem dependências.

## Estrutura

```
index.html                       Página inicial (todas as seções)
politica-de-privacidade/         Política de Privacidade
404.html                         Página exibida para endereços inexistentes
assets/css/estilos.css           Estilos (cores e espaçamentos no início do arquivo)
assets/css/noscript.css          Ajuste do menu quando o JavaScript está desativado
assets/js/main.js                Menu do celular, destaque do dia e situação "aberta/fechada"
assets/fonts/                    Fonte Figtree (licença SIL OFL, arquivo OFL-Figtree.txt)
assets/img/                      Logo otimizada, ícones e imagem de compartilhamento
farmacia_sambati_logo.png        Logo original (arquivo-mestre, não é usado diretamente nas páginas)
favicon.ico, apple-touch-icon.png
robots.txt, sitemap.xml          SEO
CNAME                            Domínio personalizado do GitHub Pages (farmaciasambati.site)
.nojekyll                        Publica os arquivos como estão, sem processamento Jekyll
```

## Como atualizar

A forma mais simples é editar pelo próprio GitHub: abra o arquivo, clique no ícone de lápis,
faça a alteração e clique em **Commit changes** na branch `main`. O GitHub Pages publica
sozinho em cerca de 1 minuto.

### Horário de funcionamento

1. `index.html`, tabela da seção `#horarios`: altere o texto e os atributos
   `data-abre` / `data-fecha` (formato `HH:MM`). O selo "Aberta agora / Fechada agora"
   é calculado a partir desses atributos, no fuso de Brasília.
2. `index.html`: cartão "Aberta todos os dias" (seção `#sobre`), texto do topo
   ("aos domingos, das 9h às 13h30") e bloco `openingHoursSpecification` dos dados estruturados
   (`<script type="application/ld+json">`).
3. Rodapé de `index.html` e de `politica-de-privacidade/index.html`.

Feriados e datas em que o site avisa que "o horário pode ser diferente" ficam em
`assets/js/main.js` (`DATAS_FIXAS` e `DATAS_MOVEIS`).

### Telefone ou endereço

Use "localizar e substituir" em todos os arquivos `.html`:

- Telefone: `(43) 3256-0119` e o link `tel:+554332560119`; nos dados estruturados, `+55 43 3256-0119`.
- Endereço: o texto e os links do Google Maps (o endereço aparece codificado na URL,
  por exemplo `R.%20Reinaldo%20Massi%2C%201333`).

A imagem de compartilhamento (`assets/img/og-farmacia-sambati.jpg`) também mostra endereço,
telefone e "Aberta todos os dias"; ela precisa ser refeita se esses dados mudarem.

### Visualizar no computador antes de publicar

```bash
python -m http.server 8080
```

Depois abra <http://localhost:8080>. Os caminhos começam com `/`, por isso abrir o arquivo
direto no navegador (duplo clique) não carrega estilos e imagens.

## Publicação e domínio

- **GitHub Pages**: *Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`*.
  Domínio personalizado `farmaciasambati.site` e opção **Enforce HTTPS** marcada.
- **DNS (Cloudflare)**: registros necessários, todos como **"Somente DNS" (nuvem cinza)**:

| Tipo  | Nome  | Conteúdo                  |
| ----- | ----- | ------------------------- |
| A     | `@`   | `185.199.108.153`         |
| A     | `@`   | `185.199.109.153`         |
| A     | `@`   | `185.199.110.153`         |
| A     | `@`   | `185.199.111.153`         |
| AAAA  | `@`   | `2606:50c0:8000::153`     |
| AAAA  | `@`   | `2606:50c0:8001::153`     |
| AAAA  | `@`   | `2606:50c0:8002::153`     |
| AAAA  | `@`   | `2606:50c0:8003::153`     |
| CNAME | `www` | `lucas-sambati.github.io` |

Com o `CNAME` de `www`, o GitHub redireciona `www.farmaciasambati.site` para o domínio principal.
Se o proxy do Cloudflare (nuvem laranja) for ativado no futuro, a Política de Privacidade precisa
mencionar o Cloudflare, pois ele passaria a intermediar os acessos.

## Verificação na Meta (Facebook / Instagram / WhatsApp)

No Gerenciador de Negócios da Meta, em **Configurações do negócio → Segurança da marca → Domínios**,
adicione `farmaciasambati.site` e escolha um método:

- **Registro TXT no DNS** (recomendado): crie no Cloudflare o registro TXT informado pela Meta.
  Não é preciso mexer no site.
- **Metatag**: cole a linha `<meta name="facebook-domain-verification" content="...">` fornecida
  pela Meta dentro do `<head>` de `index.html`, logo abaixo de `<meta name="viewport" ...>`.

Os dados de identificação exibidos no site (nome comercial, razão social, CNPJ, endereço e
telefone) seguem o cartão CNPJ da Receita Federal, para que coincidam com os documentos enviados
à Meta.

## Segurança e privacidade

- O site não usa cookies, formulários, ferramentas de análise nem scripts de terceiros. Tudo
  (fontes, imagens, scripts) é carregado do próprio domínio.
- Cada página tem uma política de segurança de conteúdo (`Content-Security-Policy`) que só
  permite recursos do próprio site. **Ao adicionar qualquer serviço externo** (Google Analytics,
  Pixel da Meta, mapa incorporado, widget de WhatsApp etc.), atualize essa linha em todas as
  páginas **e** a Política de Privacidade antes de publicar.
- Nunca coloque senhas, tokens ou chaves neste repositório: ele é público.
