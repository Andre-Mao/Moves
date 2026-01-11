let showToastFunc = null;

export function setShowToast(func) {
  showToastFunc = func;
}

export function showToast(message, type = 'info') {
  if (showToastFunc) {
    showToastFunc(message, type);
  }
}