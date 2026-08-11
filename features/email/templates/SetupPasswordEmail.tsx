// @ts-nocheck — kept for historical reference. Email rendering is owned by the API (alphakids-back)
// via Resend + @react-email/render. These web templates are not used.
import * as React from 'react';
import { Html, Head, Body, Container, Section, Heading, Text, Link } from '@react-email/components';

interface SetupPasswordEmailProps {
  setupLink: string;
}

export function SetupPasswordEmail({ setupLink }: SetupPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f7f7f7', padding: 40 }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 32, maxWidth: 480 }}>
          <Section style={{ textAlign: 'center' as const }}>
            <div style={{ width: 64, height: 64, backgroundColor: '#CCEBFF', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontSize: 28 }}>👋</span>
            </div>
            <Heading style={{ color: '#001F33', fontSize: 24, fontWeight: 700 }}>
              Bienvenido a AlphaKids
            </Heading>
            <Text style={{ color: '#575757', fontSize: 15, lineHeight: 1.5 }}>
              Un administrador creó tu cuenta en AlphaKids. Haz clic en el botón para configurar tu contraseña.
            </Text>
            <Link href={setupLink} style={{
              display: 'inline-block',
              backgroundColor: '#0199FD',
              color: '#ffffff',
              padding: '14px 32px',
              borderRadius: 12,
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 600,
              marginTop: 16,
            }}>
              Configurar contraseña
            </Link>
            <Text style={{ color: '#828282', fontSize: 13, marginTop: 24 }}>
              Este link expira en 24 horas. Si no solicitaste esta cuenta, ignora este mensaje.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
