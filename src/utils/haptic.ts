/**
 * Haptic feedback через Telegram WebApp API.
 * Безопасно вызывать вне Telegram — просто ничего не происходит.
 */

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type NotificationType = 'error' | 'success' | 'warning';

function getHaptic() {
  return (window as any).Telegram?.WebApp?.HapticFeedback ?? null;
}

export function hapticImpact(style: ImpactStyle = 'light') {
  getHaptic()?.impactOccurred(style);
}

export function hapticNotification(type: NotificationType) {
  getHaptic()?.notificationOccurred(type);
}

export function hapticSelection() {
  getHaptic()?.selectionChanged();
}
