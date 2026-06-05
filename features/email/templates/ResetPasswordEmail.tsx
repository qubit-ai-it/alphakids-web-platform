import * as React from 'react';
import { Html, Head, Body, Container, Section, Heading, Text, Link } from '@react-email/components';

interface ResetPasswordEmailProps {
  resetLink: string;
}

export function ResetPasswordEmail({ resetLink }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f7f7f7', padding: 40 }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 32, maxWidth: 480 }}>
          <Section style={{ textAlign: 'center' as const }}>
            <div style={{ width: 64, height: 64, backgroundColor: '#CCEBFF', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontSize: 28 }}>🔐</span>
            </div>
            <Heading style={{ color: '#001F33', fontSize: 24, fontWeight: 700 }}>
              Restablecé tu contraseña
            </Heading>
            <Text style={{ color: '#575757', fontSize: 15, lineHeight: 1.5 }}>
              Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón para crear una nueva.
            </Text>
            <Link href={resetLink} style={{
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
              Restablecer contraseña
            </Link>
            <Text style={{ color: '#828282', fontSize: 13, marginTop: 24 }}>
              Este link expira en 1 hora. Si no solicitaste este cambio, ignorá este mensaje.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
