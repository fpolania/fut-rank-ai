import Swal from 'sweetalert2';
export const successAlert = (title: string, text?: string) => {
  Swal.fire({
    title,
    text,
    icon: 'success',
    background: '#020617',
    color: '#fff',
    confirmButtonColor: '#39ff14',
    confirmButtonText: '🔥 Melo',
    customClass: {
      popup: 'fut-alert-popup',
    },
  });
};
export const errorAlert = (title: string, text?: string) => {
  Swal.fire({
    title,
    text,
    icon: 'error',
    background: '#020617',
    color: '#fff',
    confirmButtonColor: '#ff3b3b',
    confirmButtonText: 'Cerrar',
    customClass: {
      popup: 'fut-alert-popup',
    },
  });
};

export const warningAlert = (title: string, text?: string) => {
  Swal.fire({
    title,
    text,
    icon: 'warning',
    background: '#020617',
    color: '#fff',
    confirmButtonColor: '#facc15',
    confirmButtonText: 'Entendido',
    customClass: {
      popup: 'fut-alert-popup',
    },
  });
};

export const infoAlert = async (
  title: string,
  text?: string,
  copyValue?: string,
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'info',
    background: '#020617',
    color: '#fff',
    confirmButtonColor: '#3b82f6',
    confirmButtonText: copyValue ? '📋 Copiar llave' : 'Entendido',
    showCancelButton: !!copyValue,
    cancelButtonText: 'Cerrar',
    cancelButtonColor: '#475569',
    customClass: {
      popup: 'fut-alert-popup',
    },
  });

  if (copyValue && result.isConfirmed) {
    await navigator.clipboard.writeText(copyValue);
    await Swal.fire({
      title: '✅ Llave copiada',
      text: 'La llave fue copiada al portapapeles.',
      icon: 'success',
      background: '#020617',
      color: '#fff',
      confirmButtonColor: '#39ff14',
      confirmButtonText: '🔥 Melo',
      customClass: {
        popup: 'fut-alert-popup',
      },
    });
  }

  return result;
};
