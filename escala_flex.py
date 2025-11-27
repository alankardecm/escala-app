import streamlit as st
import pandas as pd
import sqlite3
from datetime import datetime

# --- Configura??o Inicial ---
st.set_page_config(page_title="EscalaFlex", layout="wide")
st.title("?? EscalaFlex - Gerador de Escalas Manual")

# --- Banco de Dados SQLite ---
conn = sqlite3.connect("escala.db")
cursor = conn.cursor()

# Cria??o de tabelas iniciais
cursor.execute('''
CREATE TABLE IF NOT EXISTS colaboradores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
)
''')
cursor.execute('''
CREATE TABLE IF NOT EXISTS historico (
    data TEXT,
    turno TEXT,
    colaborador TEXT
)
''')
conn.commit()

# --- Sidebar: Cadastro de Colaboradores ---
st.sidebar.header("?? Cadastro de Colaboradores")
nome = st.sidebar.text_input("Nome do colaborador")
if st.sidebar.button("Adicionar colaborador"):
    cursor.execute("INSERT INTO colaboradores (nome) VALUES (?)", (nome,))
    conn.commit()
    st.sidebar.success("Colaborador adicionado!")

# --- Visualizar Lista de Colaboradores ---
st.subheader("?? Lista de Colaboradores")
df_colab = pd.read_sql_query("SELECT * FROM colaboradores", conn)
st.dataframe(df_colab, use_container_width=True)

# --- Montagem Manual da Escala ---
st.subheader("?? Montagem Manual da Escala")
qtd_linhas = st.number_input("Quantas linhas deseja na escala?", min_value=1, max_value=100, value=10)

escalas = []
colabs = df_colab['nome'].tolist()

for i in range(qtd_linhas):
    col1, col2, col3 = st.columns([3, 2, 3])
    with col1:
        data = st.date_input(f"Data {i+1}", key=f"data_{i}")
    with col2:
        turno = st.text_input(f"Turno {i+1}", key=f"turno_{i}")
    with col3:
        colaborador = st.selectbox(f"Colaborador {i+1}", options=colabs, key=f"colab_{i}")
    escalas.append({"Data": data.strftime("%d/%m/%Y"), "Turno": turno, "Colaborador": colaborador})

if st.button("Salvar Escala"):
    for linha in escalas:
        cursor.execute("INSERT INTO historico (data, turno, colaborador) VALUES (?, ?, ?)",
                       (linha['Data'], linha['Turno'], linha['Colaborador']))
    conn.commit()
    st.success("Escala salva no hist車rico!")

    df_resultado = pd.DataFrame(escalas)
    st.dataframe(df_resultado, use_container_width=True)

    csv = df_resultado.to_csv(index=False).encode('utf-8')
    st.download_button("?? Baixar Escala CSV", data=csv, file_name="escala_manual.csv", mime="text/csv")

# --- Importa??o Direta do Excel ---
st.subheader("?? Importar Escala do Excel (.xlsx)")
arquivo_excel = st.file_uploader("Escolha o arquivo Excel", type="xlsx")

if arquivo_excel:
    aba = "JUNHO_25"
    try:
        df_raw = pd.read_excel(arquivo_excel, sheet_name=aba, header=None)
        dias = pd.to_numeric(df_raw.iloc[2, 3:], errors='coerce').reset_index(drop=True)
        semana = df_raw.iloc[3, 3:].values
        df_colabs = df_raw.iloc[4:, :3]
        df_escala = df_raw.iloc[4:, 3:]
        df_colabs.columns = ['Setor', 'Nome', 'Intervalo']
        df_colabs = df_colabs.ffill()

        registros = []
        for i, row in df_colabs.iterrows():
            if i < len(df_escala):
                escalas = df_escala.iloc[i].values
                for j, turno in enumerate(escalas):
                    if j < len(dias) and pd.notna(dias[j]) and pd.notna(turno):
                        registros.append({
                            'Data': f"2025-06-{int(dias[j]):02d}",
                            'Turno': str(turno),
                            'Colaborador': row['Nome']
                        })

        df_importado = pd.DataFrame(registros)
        for _, row in df_importado.iterrows():
            cursor.execute("INSERT INTO historico (data, turno, colaborador) VALUES (?, ?, ?)",
                           (row['Data'], row['Turno'], row['Colaborador']))
        conn.commit()
        st.success("Escala importada com sucesso!")
    except Exception as e:
        st.error(f"Erro ao processar a planilha: {e}")

# --- Visualizar Hist車rico Salvo ---
st.subheader("?? Hist車rico de Escalas")
df_hist = pd.read_sql_query("SELECT * FROM historico ORDER BY data", conn)
st.dataframe(df_hist, use_container_width=True)

# --- Filtros ---
st.subheader("?? Filtro de Hist車rico")
col1, col2 = st.columns(2)
with col1:
    filtro_colab = st.selectbox("Filtrar por colaborador", options=["Todos"] + colabs)
with col2:
    filtro_data = st.date_input("A partir de qual data?", value=datetime.today())

df_filtrado = df_hist.copy()
if filtro_colab != "Todos":
    df_filtrado = df_filtrado[df_filtrado['colaborador'] == filtro_colab]
df_filtrado = df_filtrado[pd.to_datetime(df_filtrado['data'], dayfirst=True) >= pd.to_datetime(filtro_data)]

st.dataframe(df_filtrado, use_container_width=True)

# --- Exportar Hist車rico Filtrado ---
csv_filtro = df_filtrado.to_csv(index=False).encode('utf-8')
st.download_button("?? Baixar Hist車rico Filtrado", data=csv_filtro, file_name="historico_filtrado.csv", mime="text/csv")
