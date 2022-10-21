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
      CURRENT_STATUS: 'Status',
      ACTIONS: 'Actions',
      SUGGESTED_ACTIONS: 'Suggested Actions',
      UNDER_6_MONTHS: 'Child is under 6 months. Please reevaluate when child is 6 months old.',
      SEVERE_ACUTE: 'Child is severely malnourished',
      SERVERE_REPORT: 'Report to country coordinator, encourage visit to medical clinic',
      SERVERE_PROVIDE: 'Provide --- calories per day until other assistance is available',
      SERVERE_VERIFY: 'Verify weight, height, and age',
      SERVERE_REVIEW: 'Review 5 areas of healthy behavior from the health lessons to see if the family can make improvements',
      SERVERE_WEIGH: 'Weigh and measure child in 1 month',
      MODERATE_ACUTE_CHILD: 'Child is moderately malnourished',
      MODERATE_ACUTE_PROVIDE: 'Provide 400 Kcal/day per day Verify weight, height and age',
      MODERATE_ACUTE_ENCOUARAGE: 'Encourage family to go to medical center',
      MODERATE_ACUTE_REVIEW: 'Review 5 areas of healthy behavior from the health lessons to see if the family can make improvements',
      MODERATE_ACUTE_WEIGH: 'Weigh and measure child in 1 month',
      RED_CHILD: 'Child is undernourished',
      RED_START: 'Start giving the child supplements (240 Kcal/day)',
      RED_ENROLL: 'Enroll the caregiver in the health lessons',
      RED_INCLUDE: 'Include in the next screening',
      ORANGE_CHILD: 'Child is at risk of malnourishment',
      ORANGE_ENROLL: 'Enroll the caregiver in health lessons',
      ORANGE_ENCOURAGE: 'Encourage the child to come to the next screening',
      GREEN_CHILD: 'Child is normal',
      GREEN_TELL: 'Tell caregiver child is welcome to come to the next screening and they can attend the health lessons if they would like',
      PRIOR_UNDERNOURISHED_CONTINUE: 'Continue giving micro-nutrients',
      PRIOR_UNDERNOURISHED_REVIEW: 'Review healthy behaviors',
      PRIOR_UNDERNOURISHED_INCLUDE_HEALTH: 'Include health lessons',
      PRIOR_UNDERNOURISHED_INCLUDE_NEXT: 'Include in the next screening',
      PRIOR_ORGANGE_ENROLL: 'Enroll the caregiver in health lessons',
      PRIOR_ORGANGE_ENCOURAGE: 'Encourage the child to come to the next screening',
      PRIOR_GREEN_TELL: 'Tell caregiver the child is welcome to come to the next screening and they can attend the health lesson if they would like',
      RESCREEN_ONE_MONTH: 'Rescreen in one month',
      REVIEW_HEALTH_LESSONS: 'Review 5 areas of healthy behavior from the health lessons to see if the family can make improvements',

      MIN_HEALTH_HEIGHT: 'Minimum Healthy Height',
      CHILD_HEIGHT_GRAPH: 'Child Height (cm)',
      CHILD_AGE_GRAPH: 'Child Age (months)',
      HEIGHT_AGE_CURVE: 'Height/Age Curve',
      CHILD_HEIGHT_KEY: 'Childs Height',

      MIN_HEALTH_WEIGHT: 'Minimum Healthy Weight',
      CHILD_WEIGHT_GRAPH: 'Child Weight (kg)',
      WEIGHT_AGE_GRAPH: 'Weight/Age Curve',
      CHILD_WEIGHT_KEY: 'Childs Weight',

      MIN_HEALTH_WEIGHT_HEIGHT: 'Minimum Healthy Weight/Height',
      WEIGHT_HEIGHT_GRAPH: 'Weight/Height Curve',
      ZSCORE: 'Zscore',

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
      REFRESH_COUNTRY: 'Refresh Country List',
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
      ' You must be signed in and have internet access to sync. To sync another stake, Press Bountiful Kids on the top menu bar, ' +
      'Select the country and stake, and hit the sync button. To conserve storage on your device, only sync stakes you are working with.',
      REMOVE_SCREENING_MSG: 'Pressing the button above will remove this screening record from the local database, and on the next ' +
      'successful sync, the record will be removed from the remote database.',
      EDIT_CHANGE_VALUES: 'Edit, Change values',
      NEW_SCREENING: 'New Screening',
      GENERATE_REPORT: 'Generate .csv file for downloading',
      GENERATE_SUPPLEMENT_REPORT: 'Generate monthly supplement report',
      GENERATE_HEALTH_LESSON_REPORT: 'Generate health lessons report',
      GENERATE_WOMEN_REPORT: 'Generate pregnant women, nursing mothers report',
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
      CHILD_36: 'Child does not qualify',
      CHILD_START_TOO_OLD: 'Child is over 36 months',
      INPUT_ERROR: 'Input Error:',
      INVALID_DATA: 'Invalid or missing data',
      PLEASE_CORRECT: 'Please correct or enter required fields',
      CLOSE: 'Close',
      ERROR_UPDATING: 'Error updating child ',
      MAKE_SELECTION: 'Make a selection',
      EXISTS_DATABASE: ' exists in database',
      INVALID_DELIVERY_DATE: 'Invalid delivery date',
      CORRECT_DELIVERY_DATE: 'Enter correct delivery date',
      INVALID_CHILDS_BDATE: 'Invalid childs age',
      CORRECT_CHILD_BDATE: 'Must be 0 to 6 months',
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

      CURRENT_STATUS: 'Estado',
      ACTIONS: 'Acción',
      UNDER_6_MONTHS: 'El niño tiene menos de 6 meses. Por favor reevalúe cuando el niño tiene 6 meses de edad.',
      SEVERE_ACUTE: 'El niño está gravemente desnutrido',
      SERVERE_REPORT: 'Informe al coordinador del país, fomentar la visita a la clínica médica',
      SERVERE_PROVIDE: 'Proporcionar --- calorías por día hasta que haya otra asistencia disponible',
      SERVERE_VERIFY: 'Verifique el peso, la altura y la edad',
      SERVERE_REVIEW: 'Repase 5 áreas de comportamiento saludable de las lecciones de salud para ver si la familia puede hacer mejoras',
      SERVERE_WEIGH: 'Pesar y medir al niño en 1 mes',
      MODERATE_ACUTE_CHILD: 'El niño está moderadamente desnutrido',
      MODERATE_ACUTE_PROVIDE: 'Proporcionar 400 Kcal / día al día Verificar peso, altura y edad',
      MODERATE_ACUTE_ENCOUARAGE: 'Alentar a la familia a ir al centro médico',
      MODERATE_ACUTE_REVIEW: 'Repase 5 áreas de comportamiento saludable de las lecciones de salud para ver si la familia puede hacer mejoras',
      MODERATE_ACUTE_WEIGH: 'Pesar y medir al niño en 1 mes',
      RED_CHILD: 'El niño está desnutrido',
      RED_START: 'Comience a dar los suplementos infantiles (240 Kcal / día)',
      RED_ENROLL: 'Inscribir al cuidador en las lecciones de salud',
      RED_INCLUDE: 'Incluir en la siguiente cribado',
      ORANGE_CHILD: 'El niño está en riesgo de desnutrición',
      ORANGE_ENROLL: 'Inscribir al cuidador en las lecciones de salud',
      ORANGE_ENCOURAGE: 'Anime al niño a que venga a la siguiente cribado',
      GREEN_CHILD: 'El niño es normal',
      GREEN_TELL: 'Dígale al niño cuidador que es bienvenido a venir a la siguiente prueba y ellos pueden asistir a las lecciones de salud si quisieran',
      PRIOR_UNDERNOURISHED_CONTINUE: 'Continuar dando 240 Kcal / día',
      PRIOR_UNDERNOURISHED_REVIEW: 'Revisar los comportamientos saludables',
      PRIOR_UNDERNOURISHED_INCLUDE_HEALTH: 'Incluir lecciones de salud',
      PRIOR_UNDERNOURISHED_INCLUDE_NEXT: 'Incluir en la siguiente cribado',
      PRIOR_ORGANGE_ENROLL: 'Inscribir al cuidador en las lecciones de salud',
      PRIOR_ORGANGE_ENCOURAGE: 'Anime al niño a que venga a la siguiente cribado',
      PRIOR_GREEN_TELL: 'Diga al cuidador que el niño es bienvenido a venir a la siguiente pantalla y ellos pueden asistir a la lección de salud si les gustaría',
      RESCREEN_ONE_MONTH: 'Restablecer en un mes',
      REVIEW_HEALTH_LESSONS: 'Repase 5 áreas de comportamiento saludable de las lecciones de salud para ver si la familia puede hacer mejoras',

      MIN_HEALTH_HEIGHT: 'Altura Mínima Saludable',
      CHILD_HEIGHT_GRAPH: 'Altura del niño (cm)',
      CHILD_AGE_GRAPH: 'Edad del niño (meses)',
      HEIGHT_AGE_CURVE: 'Curva Altura/Edad',
      CHILD_HEIGHT_KEY: 'Altura del niño',

      MIN_HEALTH_WEIGHT: 'Peso Mínimo Saludable',
      CHILD_WEIGHT_GRAPH: 'Peso del niño (kg)',
      WEIGHT_AGE_GRAPH: 'Curva peso/edad',
      CHILD_WEIGHT_KEY: 'Peso del niño',

      MIN_HEALTH_WEIGHT_HEIGHT: 'Peso/Altura Mínima Saludable',
      WEIGHT_HEIGHT_GRAPH: 'Curva de peso/altura',

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
      REFRESH_COUNTRY: 'Actualizar la lista de países',
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
      GENERATE_SUPPLEMENT_REPORT: 'Generar informe de suplemento mensual',
      GENERATE_HEALTH_LESSON_REPORT: 'Generar lecciones de salud',
      GENERATE_WOMEN_REPORT: 'Generar mujeres embarazadas, informe de madres lactantes',
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
      EXPECTED_DELIVERY_DATE: 'Fecha de Parto Estimada',
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
      CHILD_36: 'El niño no califica',
      CHILD_START_TOO_OLD: 'El niño tiene más de 36 meses',
      INPUT_ERROR: 'Error de entrada:',
      INVALID_DATA: 'Datos no válidos o que faltan',
      PLEASE_CORRECT: 'Corrija o ingrese los campos obligatorios',
      CLOSE: 'Cerca',
      ERROR_UPDATING: 'Error al actualizar al niño ',
      MAKE_SELECTION: 'Has una elección',
      EXISTS_DATABASE: ' Existe en la base de datos',
      INVALID_DELIVERY_DATE: 'Fecha de parto no válida',
      CORRECT_DELIVERY_DATE: 'Introduzca la fecha de entrega correcta',
      INVALID_CHILDS_BDATE: 'Edad de los niños no válidos',
      CORRECT_CHILD_BDATE: 'Debe ser de 0 a 6 meses',
      NEW_FEATURES: ' Nuevas funciones de búsqueda y filtro: Ahora puede buscar escribiendo el nombre en la ventana de búsqueda.' +
      'Si escribe el nombre de un niño existente, se le llevará a la pantalla para ingresar a una nueva proyección.' +
      'La búsqueda también se realiza, después de introducir los nombres y apellidos en el formulario nuevo hijo.' +
      'Si se encuentra una coincidencia, se le pedirá que añada una nueva selección o continúe editando.' +
      'Los botones de filtro le permiten ver a los niños por color de estado, o ver a todos los niños.'
    };

    var translationsFR = {
      AGE: 'âge (mois)',
      BIRTHDATE: 'Date de naissance',
      HEIGHT: 'Hauteur (cm)',
      WEIGHT: 'Poids (kg)',
      Z_SCORES: 'Z Scores',
      H_A: 'Taille/âge',
      W_A: 'Poids/âge',
      W_H: 'Poids/hauteur',
      CURRENT_STATUS: 'Statut',
      ACTIONS: 'Actes',
      SUGGESTED_ACTIONS: 'Actions suggérées',
      SEVERE_ACUTE: 'Lenfant est gravement malnutri',
      SERVERE_REPORT: 'Rapport au coordonnateur du pays, encourager la visite à la clinique médicale',
      SERVERE_PROVIDE: 'Fournir --- des calories par jour jusquà ce que lassistance soit disponible',
      SERVERE_VERIFY: 'Vérifier le poids, la taille et lâge',
      SERVERE_REVIEW: 'Examinez 5 domaines de comportement sain à partir des cours de santé pour voir si la famille peut apporter des améliorations',
      SERVERE_WEIGH: 'Peser et mesurer lenfant dans 1 mois',
      MODERATE_ACUTE_CHILD: 'Lenfant est modérément mal nourri',
      MODERATE_ACUTE_PROVIDE: 'Fournir 400 Kcal / jour par jour Vérifier le poids, la taille et lâge',
      MODERATE_ACUTE_ENCOUARAGE: 'Encouragez la famille à aller au centre médical',
      MODERATE_ACUTE_REVIEW: 'Examinez 5 domaines de comportement sain à partir des cours de santé pour voir si la famille peut apporter des améliorations',
      MODERATE_ACUTE_WEIGH: 'Peser et mesurer lenfant dans 1 mois',
      RED_CHILD: 'Lenfant est sous-alimenté',
      RED_START: 'Commencez à donner les suppléments pour enfants (240 Kcal / jour)',
      RED_ENROLL: 'Inscrivez le soignant dans les cours de santé',
      RED_INCLUDE: 'Inclure dans le prochain dépistage',
      ORANGE_CHILD: 'Lenfant court le risque de malnutrition',
      ORANGE_ENROLL: 'Inscrivez le soignant dans les cours de santé',
      ORANGE_ENCOURAGE: 'Encouragez lenfant à passer à la prochaine projection',
      GREEN_CHILD: 'Lenfant est normal',
      GREEN_TELL: 'Lenfant aidant est informé que les enfants seront invités à passer au prochain examen et ils pourront suivre les cours de santé sils le souhaitent',
      PRIOR_UNDERNOURISHED_CONTINUE: 'Continuer à donner 240 Kcal / jour',
      PRIOR_UNDERNOURISHED_REVIEW: 'Examiner les comportements sains',
      PRIOR_UNDERNOURISHED_INCLUDE_HEALTH: 'Inclure des leçons de santé',
      PRIOR_UNDERNOURISHED_INCLUDE_NEXT: 'Inclure dans le prochain dépistage',
      PRIOR_ORGANGE_ENROLL: 'Inscrivez le soignant dans les cours de santé',
      PRIOR_ORGANGE_ENCOURAGE: 'Encouragez lenfant à passer à la prochaine projection',
      PRIOR_GREEN_TELL: 'Dites à laidant que lenfant est invité à passer à lécran suivant et ils peuvent suivre la leçon de santé sils le souhaitent',

      SCREENING_DONE_BY: 'Dépistage effectué par',
      ADD_SCREENING: 'Ajouter le dépistage',
      SCREENING_DATE: 'Date de dépistage',
      REMOVE_CHILD_RECORD: 'Supprimer le dossier denfant',
      EDIT_EXISTING_CHILD: 'Modifier lenfant existant',
      ADD_NEW_CHILD: 'Ajouter un nouvel enfant',
      CANCEL: 'Annuler',
      YES: 'Oui',
      NO: 'Non',
      UPDATE: 'Sauvegarder et continuer',
      CREATE: 'créer',
      CHILD_RECORD: 'Enregistrement denfant',
      FIRST_NAME: 'Prénom',
      LAST_NAME: 'Nom de famille',
      REQUIRED: 'Champs obligatoires',
      AGE_IN_MONTHS: 'Âge en mois',
      AGE_BIRTHDATE: 'Âge (mois 1-60) ou date de naissance requise',
      TELEPHONE_NUMBER: 'Numéro de téléphone',
      GENDER: 'Le genre',
      GENDER_REQUIRED: 'Sexe nécessaire',
      INVALID_FIELDS: 'Corriger ou saisir les champs obligatoires',
      MOTHER: 'Mère',
      FATHER: 'Père',
      STREET_ADDRESS: 'Adresse de rue',
      CITY: 'Ville',
      ID_GROUP: 'Id/Group',
      WARD: 'quartier',
      COMMENTS: 'commentaires',
      LDS_MEMBER: 'Membre de LDS?',
      TXT_MALE: 'Garçon',
      TXT_FEMALE: 'Fille',
      STAKE: 'Emplacement LDS',
      SYNC: 'Synchroniser',
      NO_CHILDREN_LISTED: 'Aucun enfant nest-il répertorié?',
      BORN: 'née',
      RECORD_CREATED: 'Enregistrement créé',
      BY: 'par',
      REFRESH_COUNTRY: 'Actualiser la liste des pays',
      DESCRIBE_CHROME: 'Conçu pour une utilisation hors ligne avec Chrome. Vous devez activer les pages hors ligne dans le navigateur Chrome. ' +
      'Ouvrez votre navigateur sur chrome: // flags / # offline-pages-mode, et assurez-vous que cette option est activée.',
      SELECT_STAKE: 'Sélectionner la participation',
      SELECT_WARD: 'Salle de sélection',
      ALL_WARDS: 'Tous les quartiers',
      ALL_CHILDREN: 'Tous les enfants',
      SCREENED_ON: 'Projeté sur',
      PLEASE_ENTER_VALID_HEIGHT_LT_24: 'Entrez une hauteur valide (45-110cm)',
      PLEASE_ENTER_VALID_HEIGHT_GT_24: 'Entrez une hauteur valide (65-120cm)',
      PLEASE_ENTER_VALID_WEIGHT: 'Entrez un poids valide (3-18 kg)',
      REMOVE_SCREENING: 'Supprimer le dépistage',
      REMOVE: 'Retirer',
      AND_RELATED_RECORDS: ' Et dossiers connexes',
      REMOVE_CHILD_MSG: 'En appuyant sur le bouton ci-dessus, ce registre enfant sera supprimé et tous les enregistrements de ' +
      'Cet enfant de la base de données locale, et sur la prochaine synchronisation réussie, tous les enregistrements relatifs à lenfant seront ' +
      'Retiré de la base de données distante.',
      SYNC_MESSAGE: 'Appuyez sur le bouton de synchronisation ci-dessus pour synchroniser tous les enregistrements denfants de la base de données distante et ' +
      'Synchronisera les enregistrements de cette machine avec la base de données distante. Avant les nouvelles projections, lorsque vous avez accès à Internet, ' +
      'Synchronisez votre pieu avant de commencer un dépistage et synchronisez-le à nouveau une fois que vous avez terminé une séance de sélection. ' +
      ' Vous devez être connecté et avoir accès à Internet pour la synchronisation. Pour synchroniser une autre participation, appuyez sur Bountiful Kids sur la barre de menu supérieure, ' +
      'Sélectionnez le pays et le pieu, et appuyez sur le bouton de synchronisation. Pour conserver le stockage sur votre appareil, ne synchronisez que les enjeux avec lesquels vous travaillez.',
      REMOVE_SCREENING_MSG: 'En appuyant sur le bouton ci-dessus, vous supprimez cet enregistrement de dépistage de la base de données locale, et le prochain' +
      'synchronisation réussie, lenregistrement sera supprimé de la base de données distante.',
      EDIT_CHANGE_VALUES: 'Modifier, modifier les valeurs',
      NEW_SCREENING: 'Nouveau dépistage',
      GENERATE_REPORT: 'Générer le fichier .csv pour le téléchargement',
      GENERATE_SUPPLEMENT_REPORT: 'Générer un rapport de supplément mensuel',
      GENERATE_WOMEN_REPORT: 'Generar mujer embarazada, Madre de Enfermería menusual',
      DOWNLOAD_MSG: 'Télécharger {{reportName}}',
      MEMBER_STATUS_REQUIRED: 'Statut dadhésion LDS requis',
      UNKNOWN: 'Inconnu',
      HEIGHT_EXCEEDED: 'Hauteur dépassée',
      REDO_MEASUREMENT: 'Veuillez refaire la mesure',
      SYNC_OR_REPORT: 'Synchroniser la base de données, créer un rapport',
      ZSCORE_STATUS: 'Z Score Statut',
      ACUTE_ZSCORE: 'Aiguë: suppléments requis',
      ACUTE: 'Aigu',
      MICRO_NUTRITION_ZSCORE: 'Micro nutriments requis',
      AT_RISK_ZSCORE: 'À risque: passez à la prochaine projection',
      AT_RISK: 'À risque',
      NORMAL_ZSCORE: 'Normal',
      MOTHER_RECORD: 'Record de la mère enceinte',
      EDIT_EXISTING_MOTHER: 'Modifier la mère existante',
      ADD_NURSING_MOTHER: 'Ajouter une mère infirmière',
      ADD_PREGNANT_WOMAN: 'Ajouter une femme enceinte',
      EXPECTED_DELIVERY_DATE: 'Date de livraison prévue',
      NURSING_CHILD_AGE: 'Enfant infirmier Date de naissance',
      SCREEN_CHILDREN: 'Enfants',
      SCREEN_PREGNANT_WOMEN: 'Femmes enceintes',
      SCREEN_NURSING_MOTHERS: 'Mères en soins infirmiers',
      DELETE_THIS_RECORD: 'Supprimer cet enregistrement',
      CHILD_GRADUATED: 'Lenfant est diplômé',
      EMPTY_LIST: 'Liste vide?',
      CSV_FILTER: '--- Sélectionnez le filtre CSV ---',
      ZSCORE_UNDER_2: 'Zscores moins de -2',
      SORT_FIELD: '--- Sélectionnez le champ de classement ---',
      CONTINUE_ADDING: 'Continuer à ajouter un enfant',
      CHILD_GT_5: 'Lenfant a plus de 36 mois',
      CHILD_GRAD: 'Lenfant est diplômé',
      CHILD_36: 'Lenfant ne se qualifie pas',
      CHILD_START_TOO_OLD: 'Lenfant a plus de 36 mois',
      INPUT_ERROR: 'Erreur dentrée:',
      INVALID_DATA: 'Données invalides ou manquantes',
      PLEASE_CORRECT: 'Veuillez corriger ou saisir les champs obligatoires',
      CLOSE: 'Fermer',
      ERROR_UPDATING: 'Erreur lors de la mise à jour de lenfant ',
      MAKE_SELECTION: 'Choisissez',
      EXISTS_DATABASE: 'Existe dans la base de données',
      INVALID_DELIVERY_DATE: 'Date de livraison invalide',
      CORRECT_DELIVERY_DATE: 'Entrez la date de livraison correcte',
      INVALID_CHILDS_BDATE: 'Âge de lenfant invalide',
      CORRECT_CHILD_BDATE: 'Doit être de 0 à 6 mois',
      NEW_FEATURES: 'Nouvelles fonctionnalités de recherche et de filtre: vous pouvez maintenant rechercher en tapant le nom dans la fenêtre de recherche.' +
      'Si vous tapez le nom dun enfant existant, vous serez dirigé vers lécran où vous entrez un nouveau dépistage.' +
      'La recherche est également effectuée après avoir entré le prénom et le nom de famille dans la nouvelle forme enfant.' +
      'Si une correspondance est trouvée, vous serez invité à ajouter un nouveau dépistage ou à continuer déditer.' +
      'Les boutons de filtre vous permettent de voir les enfants par couleur détat ou de voir tous les enfants.'
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
