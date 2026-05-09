import Swal
from 'sweetalert2';

/* SUCCESS */

export const successAlert = (

  title: string,

  text?: string

) => {

  Swal.fire({

    title,

    text,

    icon: 'success',

    background: '#020617',

    color: '#fff',

    confirmButtonColor:
      '#39ff14',

    confirmButtonText:
      '🔥 Melo',

    customClass: {

      popup:
        'fut-alert-popup'

    }

  });

};

/* ERROR */

export const errorAlert = (

  title: string,

  text?: string

) => {

  Swal.fire({

    title,

    text,

    icon: 'error',

    background: '#020617',

    color: '#fff',

    confirmButtonColor:
      '#ff3b3b',

    confirmButtonText:
      'Cerrar',

    customClass: {

      popup:
        'fut-alert-popup'

    }

  });

};

/* WARNING */

export const warningAlert = (

  title: string,

  text?: string

) => {

  Swal.fire({

    title,

    text,

    icon: 'warning',

    background: '#020617',

    color: '#fff',

    confirmButtonColor:
      '#facc15',

    confirmButtonText:
      'Entendido'

  });

};