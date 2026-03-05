# Abily — Auto-escola no bolso

Aplicativo mobile para conectar alunos e instrutores de autoescola. Instrutores gerenciam agenda, planos e aulas; alunos buscam instrutores, agendam aulas e acompanham seu progresso.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo SDK 52 |
| Navegação | React Navigation v6 |
| Web | React Native Web |
| Backend | Supabase (Postgres + Auth + Storage) |
| Autenticação | Supabase Auth + OTP (2FA) |

---

## Funcionalidades

### Aluno
- Busca e filtro de instrutores por localização e preço
- Visualização de disponibilidade e perfil do instrutor
- Agendamento de aulas com seleção de local de encontro
- Compra de planos de aulas
- Código de sessão para confirmar início da aula
- Dashboard com próximas aulas e histórico
- Perfil com estatísticas (total de aulas, horas, instrutores)
- Chat com instrutores

### Instrutor
- Dashboard com solicitações pendentes e aulas aceitas
- Gerenciamento de disponibilidade semanal
- Criação e gerenciamento de planos de aulas
- Calendário com visão de eventos e lista de aulas
- Lista de alunos (populada automaticamente ao aceitar aulas/planos)
- Perfil com preço por hora (slider), duração de aula e bio
- Avaliações de alunos
- Estatísticas de receita e aulas realizadas
- Chat com alunos

### Sessão de Aula
- Instrutor aceita solicitação → código gerado automaticamente
- Aluno vê o código no dashboard
- Instrutor digita o código → timer inicia
- Card de sessão ativa visível em ambas as dashboards

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── schedule/       # CalendarView, AvailabilityManager, EventList, ContactList
│   ├── shared/         # Avatar, ActiveSessionCard, InstructorCard
│   └── user/           # AvailabilityViewer
├── constants/
│   └── theme.js        # Design system (cores, sombras, bordas)
├── context/
│   ├── AuthContext.jsx      # Usuário autenticado + updateProfile
│   ├── PlansContext.jsx     # Planos do instrutor
│   ├── ScheduleContext.jsx  # Eventos, solicitações, contatos
│   └── SessionContext.jsx   # Sessão de aula ativa + timer
├── hooks/
│   └── useInstructorSearch.js
├── screens/
│   ├── auth/           # LoginScreen, RegisterScreen
│   ├── instructor/     # DashboardScreen, ScheduleScreen, ChatScreen, ProfileScreen, StatsScreen
│   └── user/           # UserDashboardScreen, InstructorDetailScreen, UserProfileScreen, PlanCheckoutScreen
├── services/           # auth.service, events.service, instructors.service
└── utils/
    ├── geocoding.js    # Nominatim (OpenStreetMap)
    └── travelTime.js   # Haversine + estimativa de deslocamento urbano
supabase/
└── migrations/         # 6 migrações SQL (schema + RLS + RPCs)
```

---

## Setup

### Pré-requisitos
- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- Conta no [Supabase](https://supabase.com)

### Instalação

```bash
git clone <repo>
cd CartaOnMOBILE
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz (ou configure em `src/services/supabase.js`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

### Banco de dados

Execute as migrações em ordem no Editor SQL do Supabase:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_fix_profiles_trigger_rls.sql
supabase/migrations/003_complete_profile_trigger.sql
supabase/migrations/004_complete_profile_rpc.sql
supabase/migrations/005_fix_rpc_security_check.sql
supabase/migrations/006_class_requests_and_plans_fields.sql
```

### Executar

```bash
# Web
npx expo start --web --clear

# Android
npx expo start --android

# iOS
npx expo start --ios
```

---

## Contas de Teste

| Papel | E-mail | Senha |
|---|---|---|
| Instrutor | instrutor@gmail.com | admin |
| Aluno | user@gmail.com | admin |

---

## Design System

Tema **"Estrada"** — paleta automotiva azul marinho profissional.

| Token | Valor |
|---|---|
| Primária | `#1D4ED8` |
| Gradiente login | `#0F172A → #1E3A8A → #1D4ED8` |
| Tint primário | `#EFF6FF` |
| Acento preço | `#F59E0B` |

Arquivo central: `src/constants/theme.js`
