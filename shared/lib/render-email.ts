import { render } from '@react-email/components';
import React from 'react';

export async function renderEmail(component: React.ReactElement): Promise<string> {
  return render(component);
}
