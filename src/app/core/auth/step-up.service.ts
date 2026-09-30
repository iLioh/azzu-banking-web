import { Injectable, signal } from '@angular/core';

export interface StepUpChallenge {
  code: 'STEP_UP_REQUIRED';
  reason: string;
  challengeId?: string;
}

@Injectable({ providedIn: 'root' })
export class StepUpService {
  readonly challenge = signal<StepUpChallenge | null>(null);

  require(challenge: StepUpChallenge): void {
    this.challenge.set(challenge);
  }

  clear(): void {
    this.challenge.set(null);
  }
}
