(function () {
  'use strict';

  angular
      .module('children.translate')
      .config(translateConfig);

  translateConfig.$inject = ['$translateProvider'];

  function translateConfig($translateProvider) {
    // add translation table
    var translationsEN = {
      AGE: 'Age (months)',
      BIRTHDATE: 'Birth Date',
      HEIGHT: 'Height (cm)',
      WEIGHT: 'Weight (kg)',
      Z_SCORES: 'Z Scores',
      H_A: 'height/age',
      W_A: 'weight/age',
      W_H: 'weight/height',
      SCREENING_DONE_BY: 'Screening done by',
      ADD_SCREENING: 'Add Screening',
      SCREENING_DATE: 'Screening date',
      REMOVE_CHILD_RECORD: 'Remove Child Record',
      EDIT_EXISTING_CHILD: 'Edit existing child',
      ADD_NEW_CHILD: 'Add new child',
      CANCEL: 'Cancel',
      YES: 'Yes',
      NO: 'No',
      UPDATE: 'Save And Continue',
      CREATE: 'Create',
      CHILD_RECORD: 'Child Record',
      FIRST_NAME: 'First Name',
      LAST_NAME: 'Last Name',
      REQUIRED: 'Required',
      AGE_IN_MONTHS: 'Age in Months',
      AGE_BIRTHDATE: 'Age (months 1-60) or birthdate required',
      TELEPHONE_NUMBER: 'Telephone number',
      GENDER: 'Gender',
      GENDER_REQUIRED: 'Gender required',
      INVALID_FIELDS: 'Correct or Enter required fields',
      MOTHER: 'Mother',
      FATHER: 'Father',
      STREET_ADDRESS: 'Street Address',
      CITY: 'City',
      ID_GROUP: 'Id/Group',
      WARD: 'Ward',
      COMMENTS: 'Comments',
      LDS_MEMBER: 'LDS member?',
      TXT_MALE: 'Boy',
      TXT_FEMALE: 'Girl',
      STAKE: 'LDS Stake',
      SYNC: 'Sync',
      NO_CHILDREN_LISTED: 'No children listed?',
      BORN: 'born',
      RECORD_CREATED: 'Record created',
      BY: 'by',
      SELECT_COUNTRY: 'Select Country',
      DESCRIBE_CHROME: 'Designed for offline use with Chrome. You must enable offline pages in the Chrome browser. ' +
      'Open your browser at chrome://flags/#offline-pages-mode, and ensure this option is enabled.',
      SELECT_STAKE: 'Select Stake',
      SELECT_WARD: 'Select Ward',
      ALL_WARDS: 'All Wards',
      ALL_CHILDREN: 'All Children',
      SCREENED_ON: 'Screened on',
      PLEASE_ENTER_VALID_HEIGHT_LT_24: 'Please enter a valid height (45-110cm)',
      PLEASE_ENTER_VALID_HEIGHT_GT_24: 'Please enter a valid height (65-120cm)',
      PLEASE_ENTER_VALID_WEIGHT: 'Please enter a valid weight (3-18kg)',
      REMOVE_SCREENING: 'Remove Screening',
      REMOVE: 'Remove',
      AND_RELATED_RECORDS: ' and related records',
      REMOVE_CHILD_MSG: 'Pressing the button above will remove this child record and all screening records related to ' +
      'this child from the local database, and on the next successful sync, all records related to the child will be ' +
      'removed from the remote database.',
      SYNC_MESSAGE: 'Pressing the sync button above will sync all children records from the remote database and ' +
      'will sync the records on this machine up to the remote database. Prior to new screenings, when you have internet access, ' +
      'sync your stake before you start a screening, and sync again after you have finished a screening session. ' +
      ' You must be signed in and have internet access to sync. To sync another stake, Press Liahona Kids on the top menu bar, ' +
      'Select the country and stake, and hit the sync button. To conserve storage on your device, only sync stakes you are working with.',
      REMOVE_SCREENING_MSG: 'Pressing the button above will remove this screening record from the local database, and on the next ' +
      'successful sync, the record will be removed from the remote database.',
      EDIT_CHANGE_VALUES: 'Edit, Change values',
      NEW_SCREENING: 'New Screening',
      GENERATE_REPORT: 'Generate .csv file for downloading',
      DOWNLOAD_MSG: 'Download {{reportName}}',
      MEMBER_STATUS_REQUIRED: 'LDS membership status required',
      UNKNOWN: 'Unknown',
      HEIGHT_EXCEEDED: 'Valid height exceeded',
      REDO_MEASUREMENT: 'Please redo measurement',
      SYNC_OR_REPORT: 'Sync database, Report Creation',
      ZSCORE_STATUS: 'ZScore Status',
      ACUTE_ZSCORE: 'Acute: supplements required',
      ACUTE: 'Acute',
      MICRO_NUTRITION_ZSCORE: 'Micro nutrients required',
      AT_RISK_ZSCORE: 'At Risk: Come to next screening',
      AT_RISK: 'At Risk',
      NORMAL_ZSCORE: 'Normal',
      MOTHER_RECORD: 'Expectant Mother Record',
      EDIT_EXISTING_MOTHER: 'Edit Existing Mother',
      ADD_NURSING_MOTHER: 'Add Nursing Mother',
      ADD_PREGNANT_WOMAN: 'Add Pregnant Woman',
      EXPECTED_DELIVERY_DATE: 'Expected Delivery date',
      NURSING_CHILD_AGE: 'Nursing childs Birthdate',
      SCREEN_CHILDREN: 'Children',
      SCREEN_PREGNANT_WOMEN: 'Pregnant Women',
      SCREEN_NURSING_MOTHERS: 'Nursing Mothers',
      DELETE_THIS_RECORD: 'Delete this record',
      CHILD_GRADUATED: 'Child has graduated',
      EMPTY_LIST: 'Empty list?',
      CSV_FILTER: '---Select CSV filter---',
      ZSCORE_UNDER_2: 'Zscores less than -2',
      SORT_FIELD: '---Select Sort Field---',
      CONTINUE_ADDING: 'Continue adding child',
      CHILD_GT_5: 'Child is older than 5 years old',
      CHILD_GRAD: 'Child has graduated',
      INPUT_ERROR: 'Input Error:',
      INVALID_DATA: 'Invalid or missing data',
      PLEASE_CORRECT: 'Please correct or enter required fields',
      CLOSE:'Close',
      ERROR_UPDATING: 'Error updating child ',
      MAKE_SELECTION: 'Make a selection',
      EXISTS_DATABASE: ' exists in database',
      INVALID_DELIVERY_DATE: 'Invalid delivery date',
      CORRECT_DELIVERY_DATE: 'Enter correct delivery date',
      INVALID_CHILDS_BDATE: 'Invalid childs age',
      CORRECT_CHILD_BDATE: 'Must be 0 to 3 years',
      NEW_FEATURES: ' New search and filter features: You can now search by typing the name in the search window.' +
      'If you type the name of an existing child, you will be taken to the screen where you enter a new screening.' +
      'Search is also performed after you enter first and last names in the new child form.' +
      'If a match is found, you will be prompted to add a new screening, or continue editing.' +
      'The filter buttons allow you to view children by status color, or view all children.'
    };
    var translationsES = {
      AGE: 'Edad ( meses )',
      BIRTHDATE: 'Fecha de nacimiento',
      ADD_SCREENING: 'añadir el cribado',
      SCREENING_DATE: 'Fecha de cribado',
      HEIGHT: 'Altura (cm)',
      WEIGHT: 'Peso (kg)',
      Z_SCORES: 'Las puntuaciones Z',
      H_A: 'talla / edad',
      W_A: 'peso / edad',
      W_H: 'peso / talla',
      SCREENING_DONE_BY: 'el cribado realizado por',
      REMOVE_CHILD_RECORD: 'Retire registro hijo',
      EDIT_EXISTING_CHILD: 'Editar Niño existente',
      ADD_NEW_CHILD: 'Agregar nuevo Niño',
      CANCEL: 'Cancelar',
      YES: 'Sí',
      NO: 'No',
      UPDATE: 'Actualizar ',
      CREATE: 'Crear',
      CHILD_RECORD: 'Registro de Niños',
      FIRST_NAME: 'Nombre',
      INVALID_FIELDS: 'Corregir o rellenar los campos requeridos',
      LAST_NAME: 'Apellido',
      REQUIRED: 'Requerido',
      AGE_IN_MONTHS: 'Edad en Meses',
      AGE_BIRTHDATE: 'La edad o fecha de nacimiento requerida',
      TELEPHONE_NUMBER: 'Número de teléfono',
      GENDER: 'Género',
      GENDER_REQUIRED: 'género Requerido',
      MOTHER: 'Madre',
      FATHER: 'Padre',
      STREET_ADDRESS: 'Dirección',
      CITY: 'Ciudad',
      ID_GROUP: '/ Identificación del grupo',
      WARD: 'barrio/rama',
      COMMENTS: 'comentarios',
      LDS_MEMBER: 'Iglesia SUD miembro?',
      TXT_MALE: 'Chico',
      TXT_FEMALE: 'Niña',
      STAKE: 'Estaca SUD',
      SYNC: 'Sincronizar',
      NO_CHILDREN_LISTED: 'No se enumeran los niños ?',
      BORN: 'nacido',
      RECORD_CREATED: 'Grabación creada',
      BY: 'por',
      SELECT_COUNTRY: 'Seleccionar país',
      DESCRIBE_CHROME: 'Diseñado para su uso sin conexión con Chrome . Debe habilitar las páginas sin conexión en el ' +
      'navegador Chrome . Abra su navegador en chrome: // banderas / # offline -pages- modo , y garantizar esta opción está habilitada.',
      SELECT_STAKE: 'Seleccionar Stake',
      SELECT_WARD: 'Seleccionar Ward',
      ALL_WARDS: 'todos los Wards',
      ALL_CHILDREN: 'Todos los niños',
      SCREENED_ON: 'proyectado en',
      PLEASE_ENTER_VALID_HEIGHT_LT_24: 'Por favor, introduzca una altura válida ( 45-110cm )',
      PLEASE_ENTER_VALID_HEIGHT_GT_24: 'Por favor, introduzca una altura válida ( 65-120cm )',
      PLEASE_ENTER_VALID_WEIGHT: 'Por favor, introduzca un peso válido ( 3-18kg )',
      REMOVE_SCREENING: 'Retire el cribado',
      REMOVE: 'Retire el',
      AND_RELATED_RECORDS: ' y registros relacionados',
      REMOVE_CHILD_MSG: 'Al pulsar el botón de arriba , se eliminará el registro hijo y todos los expedientes de las pruebas ' +
      'elacionadas con este niño de la base de datos local , y en la siguiente sincronización correcta , ' +
      'todos los registros relacionados con el niño será eliminado de la base de datos remota .',
      SYNC_MESSAGE: 'Al pulsar el botón de sincronización por encima de la voluntad sincronizar todos los niños a ' +
      'partir de los registros de la base de datos remota y se sincronizarán los registros de esta máquina hasta la ' +
      'base de datos remota . Antes de nuevos exámenes , cuando se tiene acceso a internet, sincronizar el juego antes ' +
      'de empezar la proyección , y de nuevo después de la sincronización    que haya terminado una sesión de proyecciones. ' +
      'Usted debe estar firmado y tener acceso de Internet para la sincronización. Para sincronizar otra estaca ,' +
      'Liahona Press niños en la barra de menú superior , Seleccionar el país y de la estaca , y pulsa el botón de sincronización . ' +
      'Para conservar el almacenamiento en el dispositivo, sólo stake de sincronización que está trabajando con.',
      REMOVE_SCREENING_MSG: 'Al pulsar el botón de arriba eliminará este registro de selección de la base de datos local , y en la siguiente ' +
      ' Sincronización correcta , el registro será eliminado de la base de datos remota',
      EDIT_CHANGE_VALUES: 'Editar , cambiar los valores',
      NEW_SCREENING: 'nueva Proyección',
      GENERATE_REPORT: 'Generar archivo CSV para descargar',
      DOWNLOAD_MSG: 'Descargar archivo {{reportName}}',
      MEMBER_STATUS_REQUIRED: 'el estado requiere LDS',
      UNKNOWN: 'desconocido',
      HEIGHT_EXCEEDED: 'Válido altura excede',
      REDO_MEASUREMENT: 'Vuelve a realizar la medición',
      SYNC_OR_REPORT: 'base de datos de sincronización , Creación de informes',
      ZSCORE_STATUS: 'zscore Estado',
      ACUTE_ZSCORE: 'agudos: los suplementos necesarios',
      ACUTE: 'agudos',
      MICRO_NUTRITION_ZSCORE: 'micro nutrientes necesarios',
      AT_RISK_ZSCORE: 'En peligro: Ven a la próxima proyección',
      AT_RISK: 'En peligro',
      NORMAL_ZSCORE: 'normal',
      MOTHER_RECORD: 'Registro de la madre expectante',
      EDIT_EXISTING_MOTHER: 'Editar la Madre Existente',
      ADD_NURSING_MOTHER: 'Añadir Madre de Enfermería',
      ADD_PREGNANT_WOMAN: 'Añadir mujer embarazada',
      EXPECTED_DELIVERY_DATE: 'Fecha de Entrega Estimada',
      NURSING_CHILD_AGE: 'Fecha de nacimiento de los hijos de enfermería',
      SCREEN_CHILDREN: 'Niños',
      SCREEN_PREGNANT_WOMEN: 'Mujeres embarazadas',
      SCREEN_NURSING_MOTHERS: 'Madres lactantes',
      DELETE_THIS_RECORD: 'Eliminar este registro',
      CHILD_GRADUATED: 'El niño se ha graduado',
      EMPTY_LIST: '¿Lista vacía?',
      CSV_FILTER: '---Seleccionar filtro CSV---',
      ZSCORE_UNDER_2: 'Zscores inferior a -2',
      SORT_FIELD: '---Seleccionar el campo Ordenar---',
      CONTINUE_ADDING: 'Continuar agregando niño',
      CHILD_GT_5: 'El niño tiene más de 5 años',
      CHILD_GRAD: 'El niño se ha graduado',
      INPUT_ERROR: 'Error de entrada:',
      INVALID_DATA: 'Datos no válidos o que faltan',
      PLEASE_CORRECT: 'Corrija o ingrese los campos obligatorios',
      CLOSE:'Cerca',
      ERROR_UPDATING: 'Error al actualizar al niño ',
      MAKE_SELECTION: 'Has una elección',
      EXISTS_DATABASE: ' Existe en la base de datos',
      INVALID_DELIVERY_DATE: 'Fecha de entrega no válida',
      CORRECT_DELIVERY_DATE: 'Introduzca la fecha de entrega correcta',
      INVALID_CHILDS_BDATE: 'Edad de los niños no válidos',
      CORRECT_CHILD_BDATE: 'Debe ser de 0 a 3 años',
      NEW_FEATURES: ' Nuevas funciones de búsqueda y filtro: Ahora puede buscar escribiendo el nombre en la ventana de búsqueda.' +
      'Si escribe el nombre de un niño existente, se le llevará a la pantalla para ingresar a una nueva proyección.' +
      'La búsqueda también se realiza, después de introducir los nombres y apellidos en el formulario nuevo hijo.' +
      'Si se encuentra una coincidencia, se le pedirá que añada una nueva selección o continúe editando.' +
      'Los botones de filtro le permiten ver a los niños por color de estado, o ver a todos los niños.'
    };
    $translateProvider
        .translations('en', translationsEN)
        .preferredLanguage('en');
    $translateProvider
        .translations('es', translationsES)
        .preferredLanguage('es');
    $translateProvider.useSanitizeValueStrategy('escape');
  }
}());
