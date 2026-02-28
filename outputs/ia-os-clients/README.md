# IA OS Clients

This folder contains per-client IA OS files. Each client has their own subdirectory.

## Structure

```
ia-os-clients/
└── [client-name]/
    ├── context-os.md       ← Their Context OS (built from reference/ia-os-context-template.md)
    ├── intake.md           ← Completed intake questionnaire (reference/ia-os-intake.md)
    ├── session-log.md      ← Running log of all sessions, outputs, and key decisions
    ├── director-manual.md  ← Created at Phase 6 go-live — their personal operating manual
    └── automations/        ← Automation scripts, configs, and templates for this client
        ├── template-propuesta.md
        ├── template-email-seguimiento.md
        └── [other templates]
```

## Creating a New Client

```bash
mkdir -p "outputs/ia-os-clients/[client-name]/automations"
touch "outputs/ia-os-clients/[client-name]/intake.md"
touch "outputs/ia-os-clients/[client-name]/context-os.md"
touch "outputs/ia-os-clients/[client-name]/session-log.md"
```

Then copy the context template:
```bash
cp reference/ia-os-context-template.md outputs/ia-os-clients/[client-name]/context-os.md
```

Then start the onboarding session:
```
/ia-os-session onboard [client-name]
```

## Reference

- Service definition: `reference/ia-os-director-framework.md`
- Intake questionnaire: `reference/ia-os-intake.md`
- Delivery playbook: `reference/ia-os-delivery-sop.md`
- Context OS template: `reference/ia-os-context-template.md`
