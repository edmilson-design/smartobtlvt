---
name: post-meeting-recap
description: Após uma reunião, busca transcrição/resumo no Meetrox, gera ata com action items, sugere atualização do deal no HubSpot e devolve o rascunho de e-mail de recap.
tools: Bash, Read, Write
---

# post-meeting-recap

Transforma reunião terminada em ata + e-mail + sugestão de update no CRM.

## Inputs esperados
- ID da reunião no Meetrox **ou** data + nome do cliente
- Opcional: deal ID no HubSpot

## Pipeline
1. **Meetrox** (curl, `.claude/MEETROX.md`): transcrição, resumo, action items, participantes
2. **Estruturar ata** em markdown: participantes, tópicos (3-5), decisões, action items `[Responsável] tarefa — prazo`, próximos passos
3. **HubSpot — apenas sugerir**:
   - Localizar deal pelo domínio
   - Sugerir update de stage se houve avanço
   - Sugerir nota com a ata
4. **E-mail de recap**:

```
ASSUNTO: Recap — {tema} ({data})

Olá {Nome},

Obrigado pelo tempo hoje. Resumo do que combinamos:

Pontos principais:
- {tópico 1}
- {tópico 2}
- {tópico 3}

Próximos passos:
- [Eu] {ação} — até {data}
- [{Cliente}] {ação} — até {data}

{Fechamento referenciando próximo touchpoint}

Qualquer ajuste, me avise.

Abraço,
{Assinatura}
```

## Saída final (em ordem)
1. Ata completa
2. Sugestões de update no HubSpot (lista para usuário confirmar)
3. Rascunho do e-mail de recap
4. Action items próprios (formato copiável)

## Regras
- Citar trechos textuais da reunião entre aspas (da transcrição Meetrox).
- Action items com responsável + prazo. Sem prazo → `[prazo a confirmar]`.
- Nunca alterar HubSpot sem confirmação.
- E-mail máximo 150 palavras.
