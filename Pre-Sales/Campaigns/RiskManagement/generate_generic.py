
import re

with open('Pre-Sales/Campaigns/RiskManagement/Prioridad.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Title and Headers
text = re.sub(r'<title>.*?</title>', '<title>{{TITULO_DOCUMENTO}}</title>', text)

# Rename sections in comments to be generic
text = text.replace('<!-- RADAR DE OPORTUNIDAD PAM -->', '<!-- SECCION 1: GRID DE OPORTUNIDADES (2 COLUMNAS + 1 FULL) -->')
text = text.replace('<!-- RADAR DE OPORTUNIDAD PAM GRID -->', '<!-- GRID DE OPORTUNIDADES -->')
text = text.replace('<!-- PREGUNTAS DE DESCUBRIMIENTO -->', '<!-- SECCION 2: LISTA DE PREGUNTAS / PROSPECCION -->')
text = text.replace('<!-- TRADUCTOR COMERCIAL - ARGUMENTO DE VENTA -->', '<!-- SECCION 3: TABLA DE TRADUCCION COMERCIAL (PROBLEMA VS VALOR) -->')
text = text.replace('<!-- TRADUCTOR COMERCIAL TABLA -->', '<!-- TABLA DE TRADUCCION COMERCIAL -->')
text = text.replace('<!-- CONCEPTO CLAVE - QUÉ ES PAM -->', '<!-- SECCION 4: BANNER DE CONCEPTO CLAVE -->')
text = text.replace('<!-- CAPACIDADES - PAM MODERNO -->', '<!-- SECCION 5: GRID DE CAPACIDADES / FUNCIONALIDADES (6 BLOQUES) -->')
text = text.replace('<!-- CAPACIDADES GRID -->', '<!-- GRID DE CAPACIDADES -->')
text = text.replace('<!-- ALCANCE PAM - QUÉ PROTEGE PAM -->', '<!-- SECCION 6: GRID DE ALCANCE / 3 PILARES -->')
text = text.replace('<!-- ALCANCE PAM GRID -->', '<!-- GRID DE ALCANCE -->')
text = text.replace('<!-- IAM VS PAM - COMPLEMENTARIEDAD -->', '<!-- SECCION 7: GRID COMPARATIVO (2 COLUMNAS SIMETRICAS) -->')
text = text.replace('<!-- IAM VS PAM GRID -->', '<!-- GRID COMPARATIVO -->')
text = text.replace('<!-- OPORTUNIDADES POR INDUSTRIA -->', '<!-- SECCION 8: CARDS POR INDUSTRIA / VERTICALES -->')
text = text.replace('<!-- OPORTUNIDADES CARDS -->', '<!-- CARDS VERTICALES -->')
text = text.replace('<!-- MANEJO DE OBJECIONES -->', '<!-- SECCION 9: TABLA DE MANEJO DE OBJECIONES -->')
text = text.replace('<!-- MANEJO DE OBJECIONES TABLA -->', '<!-- TABLA DE OBJECIONES -->')
text = text.replace('<!-- VALOR COMERCIAL -->', '<!-- SECCION 10: PROPUESTA DE VALOR Y CIERRE -->')
text = text.replace('<!-- FOOTER -->', '<!-- SECCION 11: PIE DE PAGINA / FOOTER INSTITUCIONAL -->')

with open('Pre-Sales/Campaigns/RiskManagement/Template-Generico.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Template comments and generic structure updated.")
