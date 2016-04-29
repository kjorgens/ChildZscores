(function () {
  'use strict';

  angular
      .module('children.translate')
      .config(translateConfig);

  translateConfig.$inject = ['$translateProvider'];

  function translateConfig($translateProvider) {
    // add translation table
    var translationsEN = {
      BIRTHDATE: 'Birth Date',
      ADD_SCREENING: 'Add Screening',
      SCREENING_DATE: 'Screening date',
      HEIGHT: 'Height',
      WEIGHT: 'Weight',
      Z_SCORES: 'Z Scores',
      H_A: 'height/age',
      W_A: 'weight/age',
      W_H: 'weight/height',
      SCREENING_DONE_BY: 'Screening done by',
      REMOVE_CHILD_RECORD: 'Remove Child Record',
      NAMESPACE: {
        PARAGRAPH: 'And it comes with awesome features!'
      }
    };
    var translationsES = {
      BIRTHDATE: 'Fecha de nacimiento',
      ADD_SCREENING: 'añadir el cribado',
      SCREENING_DATE: 'Fecha de cribado',
      HEIGHT: 'Altura',
      WEIGHT: 'Peso',
      Z_SCORES: 'Las puntuaciones Z',
      H_A: 'talla / edad',
      W_A: 'peso / edad',
      W_H: 'peso / talla',
      SCREENING_DONE_BY: 'el cribado realizado por',
      REMOVE_CHILD_RECORD: 'Retire registro hijo',
      NAMESPACE: {
        PARAGRAPH: 'And it comes with awesome features!'
      }
    };
    $translateProvider
        .translations('en', translationsEN)
        .preferredLanguage('en');
    $translateProvider
        .translations('es', translationsES)
        .preferredLanguage('es');
  }
}());
