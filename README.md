# Manejo Clínico de Dengue (DengueFlow)

Aplicativo web progressivo (PWA) de apoio à decisão clínica e classificação de risco para pacientes com suspeita de dengue.

---

### Fundamentação Oficial
Desenvolvido com base nas diretrizes oficiais do **Ministério da Saúde do Brasil**:
* *Dengue: Diagnóstico e Manejo Clínico – Adulto e Criança* (6ª edição revisada).
* *Guia de Vigilância em Saúde*.

---

### Funcionamento do Aplicativo

1. **Triagem e Classificação de Risco (Grupos A, B, C e D)**
   - Algoritmo sequencial de avaliação clínica: sinais de choque/gravidade (Grupo D), sinais de alarme (Grupo C), sangramentos ou condições especiais/comorbidades (Grupo B) e ausência de complicadores (Grupo A).

2. **Calculadora de Hidratação Guiada**
   - **Oral (Grupos A e B):** cálculo de volume diário (60 mL/kg/dia para adultos; regras pediátricas específicas), com divisão 1/3 de SRO e 2/3 de líquidos caseiros.
   - **Venosa (Grupos C e D):** fases de expansão rápida (10 a 20 mL/kg), reavaliação periódica e manutenção/reidratação.

3. **Calculadora da Prova do Laço**
   - Cálculo automático da Pressão Arterial Média (PAM), cronômetro para tempo de insuflação (5 min em adultos / 3 min em crianças) e interpretação do número de petéquias no quadrado de 2,5 × 2,5 cm.

4. **Guia e Fluxograma de Condutas**
   - Diretrizes de exames laboratoriais (hematócrito, plaquetas, sorologia/RT-PCR), critérios de internação, sinais de alerta e critérios de alta hospitalar.

5. **Cartão de Acompanhamento do Paciente**
   - Emissão e impressão do cartão de monitoramento ambulatorial com instruções claras de retorno e sinais de alarme.

6. **Operação 100% Offline (PWA)**
   - Funciona sem conexão à internet em postos de saúde, tendas de hidratação e emergências, com suporte à instalação nativa em Android, iOS e desktop.

---

### Tecnologias
- **Frontend:** React, TypeScript, Tailwind CSS, Lucide Icons.
- **PWA & Offline:** Vite Plugin PWA, Workbox Service Worker.
