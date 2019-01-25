(function () {
  'use strict';

  angular
    .module('children.countryInfo')
    .factory('CountryInfo', CountryInfo);

  CountryInfo.$inject = [];

  const phl_pilot = {
    countries: [
      {
        name: 'Phillippines',
        code: 'PHL',
        image: '/modules/children/client/img/philippines.png',
        stakes: [
          {
            stakeName: 'Calapan',
            stakeDB: 'calapan_phl'
          },
          {
            stakeName: 'Mindoro',
            stakeDB: 'mindoro_phl'
          },
          {
            stakeName: 'Northern Sumar',
            stakeDB: 'northern_sumar_phl'
          }
        ]
      }
    ]
  };

  const masterCountryList = {
    countries: [
      {
        name: 'Brazil',
        code: 'BRA',
        image: '/modules/children/client/img/brazil.png',
        stakes: [
          {
            stakeName: 'Belém',
            stakeDB: 'belem_bra'
          },
          {
            stakeName: 'Fortaleza',
            stakeDB: 'fortaleza_bra'
          },
          {
            stakeName: 'Manaus',
            stakeDB: 'manaus_bra'
          },
          {
            stakeName: 'Brazil test Only',
            stakeDB: 'test_stake_bra'
          }
        ]
      },
      {
        name: 'Bolivia',
        code: 'BOL',
        image: '/modules/children/client/img/bolivia.png',
        stakes: [
          {
            stakeName: 'Cochabamba Cobija Stake',
            stakeDB: 'cochabamba_cobija_stake_bol'
          },
          {
            stakeName: 'Cochabamba Jaihuayco Stake',
            stakeDB: 'cochabamba_jaihuayco_stake_bol'
          },
          {
            stakeName: 'Cochabamba Los Alamos Stake',
            stakeDB: 'cochabamba_los_alamos_stake_bol'
          },
          {
            stakeName: 'Cochabamba Sacaba Stake',
            stakeDB: 'cochabamba_sacaba_stake_bol'
          },
          {
            stakeName: 'Cochabamba Universidad Stake',
            stakeDB: 'cochabamba_universidad_stake_bol'
          },
          {
            stakeName: 'El Alto Stake',
            stakeDB: 'el_alto_stake_bol'
          },
          {
            stakeName: 'Llallagua District',
            stakeDB: 'llallagua_district_bol'
          },
          {
            stakeName: 'Montero Stake',
            stakeDB: 'montero_stake_bol'
          },
          {
            stakeName: 'Oruro Stake',
            stakeDB: 'oruro_stake_bol'
          },
          {
            stakeName: 'Puerto Suárez District',
            stakeDB: 'puerto_suarez_district_bol'
          },
          {
            stakeName: 'Riberalta & Guayaramerín Districts',
            stakeDB: 'riberalta_guayaramerin_districts_bol'
          },
          {
            stakeName: 'Santa Cruz Cañoto & La Pampa Stakes',
            stakeDB: 'santa_cruz_canoto_la_pampa_stakes_bol'
          },
          {
            stakeName: 'Sucre Stake',
            stakeDB: 'sucre_stake_bol'
          },
          {
            stakeName: 'Tarija Stake',
            stakeDB: 'tarija_stake_bol'
          },
          {
            stakeName: 'Trinidad Stake',
            stakeDB: 'trinidad_stake_bol'
          },
          {
            stakeName: 'Tupiza District',
            stakeDB: 'tupiza_district_bol'
          },
          {
            stakeName: 'Yacuiba Stake',
            stakeDB: 'yacuiba_stake_bol'
          },
          {
            stakeName: 'Bolivia Test Only',
            stakeDB: 'test_stake_bol'
          }
        ]
      },
      {
        name: 'Cambodia',
        code: 'KHM',
        image: '/modules/children/client/img/cambodia.png',
        stakes: [
          {
            stakeName: 'Battambang District',
            stakeDB: 'battambang_district_khm'
          },
          {
            stakeName: 'Chamkamorn Branch',
            stakeDB: 'chamkamorn_branch_khm'
          },
          {
            stakeName: 'Kampong Cham District',
            stakeDB: 'kampong_cham_district_khm'
          },
          {
            stakeName: 'Kampong Tom',
            stakeDB: 'kampong_tom_khm'
          },
          {
            stakeName: 'Sen Sok Branch',
            stakeDB: 'sen_sok_branch_khm'
          },
          {
            stakeName: 'Siem Reap District',
            stakeDB: 'siem_reap_district_khm'
          },
          {
            stakeName: 'Ta Khmau Branch',
            stakeDB: 'ta_khmau_branch_khm'
          },
          {
            stakeName: 'Tuol Kok Ward',
            stakeDB: 'tuol_kok_ward_khm'
          },
          {
            stakeName: 'Cambodia test Only',
            stakeDB: 'test_stake_khm'
          }
        ]
      },
      {
        name: 'Colombia',
        code: 'COL',
        image: '/modules/children/client/img/columbia.png',
        stakes: [
          {
            stakeName: 'Baranquilla',
            stakeDB: 'baranquilla_col'
          },
          {
            stakeName: 'Buenaventura',
            stakeDB: 'buenaventura_col'
          },
          {
            stakeName: 'Calima-Cali Stake',
            stakeDB: 'calima_cali_stake_col'
          },
          {
            stakeName: 'Cucuta',
            stakeDB: 'cucuta_col'
          },
          {
            stakeName: 'Guajira',
            stakeDB: 'guajira_stake_col'
          },
          {
            stakeName: 'Guajira (Rioacha Branch y Maicao Branch of the Santa Marta District)',
            stakeDB: 'guajira_col'
          },
          {
            stakeName: 'Itsmina - Choco',
            stakeDB: 'itsmina_col'
          },
          {
            stakeName: 'Ipiales',
            stakeDB: 'ipiales_col'
          },
          {
            stakeName: 'Las Tres Fronteras',
            stakeDB: 'las_tres_fronteras_col'
          },
          {
            stakeName: 'Medellin Stake',
            stakeDB: 'medellin_stake_col'
          },
          {
            stakeName: 'Monte Livano',
            stakeDB: 'monte_livano_col'
          },
          {
            stakeName: 'Palmira District',
            stakeDB: 'palmira_district_col'
          },
          {
            stakeName: 'Pasto Stake',
            stakeDB: 'pasto_stake_col'
          },
          {
            stakeName: 'Popayán District',
            stakeDB: 'popayan_district_col'
          },
          {
            stakeName: 'Quibdo - Choco',
            stakeDB: 'quibdo_choco_col'
          },
          {
            stakeName: 'Santa Marta District ',
            stakeDB: 'santa_marta_district_col'
          },
          {
            stakeName: 'Villa Colombia-Cali Stake',
            stakeDB: 'villa_columbia_stake_col'
          },
          {
            stakeName: 'Colombia Test Stake',
            stakeDB: 'test_stake_col'
          }
        ]
      },
      {
        name: 'Ecuador',
        code: 'ECU',
        image: '/modules/children/client/img/ecuador.png',
        stakes: [
          {
            stakeName: 'Cuenca Stake',
            stakeDB: 'cuenca_stake_ecu'
          },
          {
            stakeName: 'Guayacanes Branch of Esmeraldas Stake',
            stakeDB: 'guayacanes_ecu'
          },
          {
            stakeName: 'Ibarra District',
            stakeDB: 'ibarra_district_ecu'
          },
          {
            stakeName: 'Esmeraldas Stake',
            stakeDB: 'esmeraldas_stake_ecu'
          },
          {
            stakeName: 'Machala Stake',
            stakeDB: 'machala_stake_ecu'
          },
          {
            stakeName: 'Manta Stake',
            stakeDB: 'manta_stake_ecu'
          },
          {
            stakeName: 'Otavallo Stake',
            stakeDB: 'otavallo_stake_ecu'
          },
          {
            stakeName: 'Portoviejo',
            stakeDB: 'portoviejo_stake_ecu'
          },
          {
            stakeName: 'Quito Calderón Stake',
            stakeDB: 'quito_calderon_stake_ecu'
          },
          {
            stakeName: 'Quito Los Chillos Stake',
            stakeDB: 'quito_los_chillos_stake_ecu'
          },
          {
            stakeName: 'Quininde Stake',
            stakeDB: 'quininde_stake_ecu'
          },
          {
            stakeName: 'Quito Turubamba Stake',
            stakeDB: 'quito_turubamba_stake_ecu'
          },
          {
            stakeName: 'Santo Domingo Stake',
            stakeDB: 'santo_domingo_stake_ecu'
          },
          {
            stakeName: 'Ecuador test Only',
            stakeDB: 'test_stake_ecu'
          }
        ]
      },
      {
        name: 'El Salvador',
        code: 'SLV',
        image: '/modules/children/client/img/salvador.png',
        stakes: [
          {
            stakeName: 'Atiquizaya Stake',
            stakeDB: 'atiquizaya_stake_slv'
          },
          {
            stakeName: 'San Miguel Stake',
            stakeDB: 'san_miguel_stake_slv'
          },
          {
            stakeName: 'El Salvador test Only',
            stakeDB: 'test_stake_slv'
          }
        ]
      },
      {
        name: 'Ghana',
        code: 'GHA',
        image: '/modules/children/client/img/ghana.png',
        stakes: [
          {
            stakeName: 'Ashaiman Stake',
            stakeDB: 'ashaiman_stake_gha'
          },
          {
            stakeName: 'Kpong District',
            stakeDB: 'kpong_district_gha'
          },
          {
            stakeName: 'Adenta Stake',
            stakeDB: 'adenta_stake_gha'
          },
          {
            stakeName: 'Winneba Stake',
            stakeDB: 'winneba_stake_gha'
          },
          {
            stakeName: 'Cape Coast Stake',
            stakeDB: 'cape_coast_stake_gha'
          },
          {
            stakeName: 'Assin Fosu District',
            stakeDB: 'assin_fosu_district_gha'
          },
          {
            stakeName: 'Kasoa Stake',
            stakeDB: 'kasoa_stake_gha'
          },
          {
            stakeName: 'Mpinsin Stake',
            stakeDB: 'mpinsin_stake_gha'
          },
          {
            stakeName: 'Ghana test Only',
            stakeDB: 'test_stake_gha'
          }
        ]
      },
      {
        name: 'Guatamala',
        code: 'GTM',
        image: '/modules/children/client/img/guatamala.png',
        stakes: [
          {
            stakeName: 'Chulac District',
            stakeDB: 'chulac_district_gtm'
          },
          {
            stakeName: 'Cobán Stake',
            stakeDB: 'coban_stake_gtm'
          },
          {
            stakeName: 'Cuilapa District',
            stakeDB: 'cuilapa_district_gtm'
          },
          {
            stakeName: 'Escuintla Stake',
            stakeDB: 'escuintla_stake_gtm'
          },
          {
            stakeName: 'Huehuetenango Zaculeu Stake',
            stakeDB: 'huehuetenango_zaculeu_stake_gtm'
          },
          {
            stakeName: 'Jalapa Stake',
            stakeDB: 'jalapa_stake_gtm'
          },
          {
            stakeName: 'Malacatan Stake',
            stakeDB: 'malacatan_stake_gtm'
          },
          {
            stakeName: 'Momostenango Paxajtup District',
            stakeDB: 'momostenango_paxajtup_district_gtm'
          },
          {
            stakeName: 'Momostenango Stake',
            stakeDB: 'momostenango_stake_gtm'
          },
          {
            stakeName: 'Momostenango West District',
            stakeDB: 'momostenango_west_district_gtm'
          },
          {
            stakeName: 'Motagua District',
            stakeDB: 'motagua_district_gtm'
          },
          {
            stakeName: 'Patzicia Stake',
            stakeDB: 'patzicia_stake_gtm'
          },
          {
            stakeName: 'Pueblo Nuevo Tiquisate District',
            stakeDB: 'pueblo_nuevo_tiquisate_district_gtm'
          },
          {
            stakeName: 'Puerto Barrios District',
            stakeDB: 'puerto_barrios_district_gtm'
          },
          {
            stakeName: 'Puerto Barrios District',
            stakeDB: 'puerto_barrios_district_gtm'
          },
          {
            stakeName: 'Quetzaltenango el Bosque Stake',
            stakeDB: 'quetzaltenango_el_bosque_stake_gtm'
          },
          {
            stakeName: 'Quiche District',
            stakeDB: 'quiche_district_gtm'
          },
          {
            stakeName: 'Retalhuleu Stake',
            stakeDB: 'retalhuleu_stake_gtm'
          },
          {
            stakeName: 'Rio Blanco District',
            stakeDB: 'rio_blanco_district_gtm'
          },
          {
            stakeName: 'Salama District',
            stakeDB: 'salama_district_gtm'
          },
          {
            stakeName: 'San Felipe Stake',
            stakeDB: 'san_felipe_stake_gtm'
          },
          {
            stakeName: 'Serchil District',
            stakeDB: 'serchil_district_gtm'
          },
          {
            stakeName: 'Sololá District',
            stakeDB: 'solola_district_gtm'
          },
          {
            stakeName: 'Totonicapán Stake',
            stakeDB: 'totonicapan_stake_gtm'
          },
          {
            stakeName: 'Guatamala test Only',
            stakeDB: 'test_stake_gtm'
          }
        ]
      },
      {
        name: 'Haiti',
        code: 'HTI',
        image: '/modules/children/client/img/haiti.png',
        stakes: [
          {
            stakeName: 'Carrefour',
            stakeDB: 'carrefour_hti'
          },
          {
            stakeName: 'Crois -des- Mission',
            stakeDB: 'crois_des_mission_hti'
          },
          {
            stakeName: 'Port-au-Prince',
            stakeDB: 'port_au_prince_hti'
          },
          {
            stakeName: 'Haiti Test',
            stakeDB: 'haiti_test_hti'
          }
        ]
      },
      {
        name: 'Honduras',
        code: 'HND',
        image: '/modules/children/client/img/honduras.png',
        stakes: [
          {
            stakeName: 'Catacamas District',
            stakeDB: 'catacamas_district_hnd'
          },
          {
            stakeName: 'Choluteca El Porvenir Stake',
            stakeDB: 'choluteca_el_porvenir_stake_hnd'
          },
          {
            stakeName: 'Choluteca Stake',
            stakeDB: 'choluteca_stake_hnd'
          },
          {
            stakeName: 'Danli Stake',
            stakeDB: 'danli_stake_hnd'
          },
          {
            stakeName: 'El Progreso Stake',
            stakeDB: 'el_progreso_stake_hnd'
          },
          {
            stakeName: 'Fesitran Stake',
            stakeDB: 'fesitran_stake_hnd'
          },
          {
            stakeName: 'La Ceiba Stake',
            stakeDB: 'la_ceiba_stake_hnd'
          },
          {
            stakeName: 'La Lima Stake',
            stakeDB: 'la_lima_stake_hnd'
          },
          {
            stakeName: 'El Merendón Stake',
            stakeDB: 'el_merendon_stake_hnd'
          },
          {
            stakeName: 'Monjaras District',
            stakeDB: 'monjaras_district_hnd'
          },
          {
            stakeName: 'Satélite Stake',
            stakeDB: 'satelite_stake_hnd'
          },
          {
            stakeName: 'Valle Verde (San Francisco) District',
            stakeDB: 'valle_verde_district_hnd'
          },
          {
            stakeName: 'Villa Nueva Stake',
            stakeDB: 'villa_nueva_stake_hnd'
          },
          {
            stakeName: 'Honduras test Only',
            stakeDB: 'test_stake_hnd'
          }
        ]
      },
      {
        name: 'Kiribati',
        code: 'KIR',
        image: '/modules/children/client/img/kiribati.png',
        stakes: [
          {
            stakeName: 'Stake One',
            stakeDB: 'stake_one_kir'
          },
          {
            stakeName: 'Stake Two',
            stakeDB: 'stake_two_kir'
          },
          {
            stakeName: 'Kiribati test Only',
            stakeDB: 'test_stake_kir'
          }
        ]
      },
      {
        name: 'Madagascar',
        code: 'MDG',
        image: '/modules/children/client/img/madagascar.png',
        stakes: [
          {
            stakeName: 'Manakimbahiny (Tana 1) Stake',
            stakeDB: 'manakimbahiny_mdg'
          },
          {
            stakeName: 'Ivandry (Tana 2) Stake',
            stakeDB: 'ivandry_mdg'
          },
          {
            stakeName: 'Antsirabe District',
            stakeDB: 'antsirabe_mdg'
          },
          {
            stakeName: 'Tamatave District',
            stakeDB: 'tamatave_mdg'
          },
          {
            stakeName: 'Madagacar test Only',
            stakeDB: 'test_stake_mdg'
          }
        ]
      },
      {
        name: 'Mongolia',
        code: 'MNG',
        image: '/modules/children/client/img/mongolia.png',
        stakes: [
          {
            stakeName: 'Darkhan',
            stakeDB: 'darkhan_mng'
          },
          {
            stakeName: 'Mongolia test Only',
            stakeDB: 'test_stake_mng'
          }
        ]
      },
      {
        name: 'Nicaragua',
        code: 'NIC',
        image: '/modules/children/client/img/nicaragua.png',
        stakes: [
          {
            stakeName: 'Chinandega West Stake',
            stakeDB: 'chinandega_west_stake_nic'
          },
          {
            stakeName: 'Chinandega Stake',
            stakeDB: 'chinandega_stake_nic'
          },
          {
            stakeName: 'Esteli District ',
            stakeDB: 'esteli_district_nic'
          },
          {
            stakeName: 'Jinotepeque Stake',
            stakeDB: 'jinotepeque_stake_nic'
          },
          {
            stakeName: 'Leon Stake',
            stakeDB: 'leon_stake_nic'
          },
          {
            stakeName: 'Matagalpa District',
            stakeDB: 'matagalpa_district_nic'
          },
          {
            stakeName: 'Villa Flor Stake',
            stakeDB: 'villa_flor_stake_nic'
          },
          {
            stakeName: 'Nicaragua test Only',
            stakeDB: 'test_stake_nic'
          }
        ]
      },
      {
        name: 'Paraguay',
        code: 'PRY',
        image: '/modules/children/client/img/paraguay.png',
        stakes: [
          {
            stakeName: 'Distrito Pedro Juan Cabelero',
            stakeDB: 'distrito_pedro_juan_cabalero_pry'
          },
          {
            stakeName: 'Distrito Mariano Roque Alonzo',
            stakeDB: 'distrito_mariano_roque_alonzo_pry'
          },
          {
            stakeName: 'Distrito San Lorenzo',
            stakeDB: 'distrito_san_lorenzo_pry'
          },
          {
            stakeName: 'Distrito Concepcion',
            stakeDB: 'distrito_concepcion_pry'
          },
          {
            stakeName: 'Distrito Boqueron -Abundancia',
            stakeDB: 'distrito_boqueron_abundancia_pry'
          },
          {
            stakeName: 'Distrito Caaruazú',
            stakeDB: 'distrito_coronel_oviedo_pry'
          },
          {
            stakeName: 'Nemby',
            stakeDB: 'nemby_stake_pry'
          },
          {
            stakeName: 'Distrito Paraguari',
            stakeDB: 'ita_paraguari_stake_pry'
          },
          {
            stakeName: 'Caacupe',
            stakeDB: 'caacupe_stake_pry'
          },
          {
            stakeName: 'Luque Sur',
            stakeDB: 'luque_sur_pry'
          },
          {
            stakeName: 'Concepciob',
            stakeDB: 'concepiob_stake_pry'
          },
          {
            stakeName: 'Pilar',
            stakeDB: 'pilar_stake_pry'
          },
          {
            stakeName: 'Test Only Paraguay',
            stakeDB: 'test_stake_pry'
          }
        ]
      },
      {
        name: 'Peru',
        code: 'PER',
        image: '/modules/children/client/img/peru.png',
        stakes: [
          {
            stakeName: 'Ayacucho Stake',
            stakeDB: 'ayacucho_stake_per'
          },
          {
            stakeName: 'Arequipa Zamácola Stake',
            stakeDB: 'arequipa_zamacola_stake_per'
          },
          {
            stakeName: 'Chiclayo Stake & Lambayeque District',
            stakeDB: 'chiclayo_stake_lambayeque_district_per'
          },
          {
            stakeName: 'Cusco & Cusco Inti Raymi Stakes',
            stakeDB: 'cusco_cusco_inti_raymi_stakes_per'
          },
          {
            stakeName: 'Hancavelica District',
            stakeDB: 'hancavelica_district_per'
          },
          {
            stakeName: 'huancayo_stake',
            stakeDB: 'huancayo_stake_per'
          },
          {
            stakeName: 'Iquitos 9 de Octubre Stake',
            stakeDB: 'iquitos_de_octubre_stake_per'
          },
          {
            stakeName: 'Iquitos Punchana Stake',
            stakeDB: 'iquitos_punchana_stake_per'
          },
          {
            stakeName: 'Iquitos Stake',
            stakeDB: 'iquitos_stake_per'
          },
          {
            stakeName: 'Jaén Stake',
            stakeDB: 'jaen_stake_per'
          },
          {
            stakeName: 'Juli District',
            stakeDB: 'juli_district_per'
          },
          {
            stakeName: 'Juliaca Stake',
            stakeDB: 'juliaca_stake_per'
          },
          {
            stakeName: 'La Esperanza',
            stakeDB: 'la_esperanza_per'
          },
          {
            stakeName: 'Lima Canto Grande Stake',
            stakeDB: 'lima_canto_grande_stake_per'
          },
          {
            stakeName: 'Lima Santa Isabel Stake',
            stakeDB: 'lima_santa_isabel_stake_per'
          },
          {
            stakeName: 'Moyobamba/Belen Branches (Moyobamba District)',
            stakeDB: 'moyobamba_belen_branches_moyobamba_district_per'
          },
          {
            stakeName: 'Nauta Area (Near Iquitos)',
            stakeDB: 'nauta_area_near_iquitos_per'
          },
          {
            stakeName: 'Nueva Cajamarca',
            stakeDB: 'nueva_cajamarca_per'
          },
          {
            stakeName: 'Paita District',
            stakeDB: 'paita_district_per'
          },
          {
            stakeName: 'Partido Alto Branch (Tarapoto District)',
            stakeDB: 'partido_alto_branch_tarapoto_district_per'
          },
          {
            stakeName: 'Piura Castilla Stake',
            stakeDB: 'piura_castilla_stake_per'
          },
          {
            stakeName: 'Piura Central Stake',
            stakeDB: 'piura_central_stake_per'
          },
          {
            stakeName: 'Piura Miraflores Stake',
            stakeDB: 'piura_miraflores_stake_per'
          },
          {
            stakeName: 'Piura Sullana Stake',
            stakeDB: 'piura_sullana_stake_per'
          },
          {
            stakeName: 'Piura Talara District',
            stakeDB: 'piura_talara_district_per'
          },
          {
            stakeName: 'Pucallpa Stake',
            stakeDB: 'pucallpa_stake_per'
          },
          {
            stakeName: 'Rioja Branch (Moyobamba District)',
            stakeDB: 'rioja_branch_moyobamba_district_per'
          },
          {
            stakeName: 'Shilcayo Branch (Tarapoto District)',
            stakeDB: 'shilcayo_branch_tarapoto_district_per'
          },
          {
            stakeName: 'Tamani',
            stakeDB: 'tamani_per'
          },
          {
            stakeName: 'Tres Fronteras',
            stakeDB: 'tres_fronteras_per'
          },
          {
            stakeName: 'Trujillo East Stake',
            stakeDB: 'trujillo_east_stake_per'
          },
          {
            stakeName: 'Tumbes Stake',
            stakeDB: 'tumbes_stake_per'
          },
          {
            stakeName: 'Urubamba (Valle Sagrado District)',
            stakeDB: 'urubamba_valle_sagrado_district_per'
          },
          {
            stakeName: 'Viru Stake',
            stakeDB: 'viru_stake_per'
          },
          {
            stakeName: 'Yurimaguas Branch (Trarpoto District)',
            stakeDB: 'yurimaguas_branch_trarpoto_district_per'
          },
          {
            stakeName: 'Peru test Only',
            stakeDB: 'test_stake_per'
          }
        ]
      },
      {
        name: 'Phillippines',
        code: 'PHL',
        image: '/modules/children/client/img/philippines.png',
        stakes: [
          {
            stakeName: 'Alaminos District',
            stakeDB: 'alaminos_district_phl'
          },
          {
            stakeName: 'Antique stake',
            stakeDB: 'antique_stake_phl'
          },
          {
            stakeName: 'Aguilar District',
            stakeDB: 'anguilar_district_phl'
          },
          {
            stakeName: 'Bacolod Stake',
            stakeDB: 'bacolod_stake_phl'
          },
          {
            stakeName: 'Bacolod South Stake',
            stakeDB: 'bacolod_south_stake_phl'
          },
          {
            stakeName: 'Bacolod North Stake',
            stakeDB: 'bacolod_nor_phl'
          },
          {
            stakeName: 'Bogo District',
            stakeDB: 'bogo_district_phl'
          },
          {
            stakeName: 'Bayambang Stake',
            stakeDB: 'bayambang_stake_phl'
          },
          {
            stakeName: 'Binalbagan Stake 1',
            stakeDB: 'binalbagan_stake_1_phl'
          },
          {
            stakeName: 'Binalbagan Stake 2',
            stakeDB: 'binalbagan_stake_2_phl'
          },
          {
            stakeName: 'Bulan District',
            stakeDB: 'bulan_district_phl'
          },
          {
            stakeName: 'Cadiz Stake',
            stakeDB: 'cadiz_stake_phl'
          },
          {
            stakeName: 'Calape District',
            stakeDB: 'calape_district_phl'
          },
          {
            stakeName: 'Calasiao District',
            stakeDB: 'calasiao_district_phl'
          },
          {
            stakeName: 'Catanduanes District',
            stakeDB: 'catanduanes_district_phl'
          },
          {
            stakeName: 'Dagupan Stake',
            stakeDB: 'dagupan_stake_phl'
          },
          {
            stakeName: 'Iloilo North Stake',
            stakeDB: 'iloilo_north_stake_phl'
          },
          {
            stakeName: 'Iloilo Stake 1',
            stakeDB: 'iloilo_stake_one_phl'
          },
          {
            stakeName: 'Iloilo Stake 2',
            stakeDB: 'iloilo_stake_two_phl'
          },
          {
            stakeName: 'Jordan Guimaras District',
            stakeDB: 'jordan_guimaras_district_phl'
          },
          {
            stakeName: 'Kalibo Stake (Aklan Province)',
            stakeDB: 'kalibo_stake_aklan_province_phl'
          },
          {
            stakeName: 'La Carlota District 1',
            stakeDB: 'la_carlota_district_1_phl'
          },
          {
            stakeName: 'La Carlota District 2',
            stakeDB: 'la_carlota_district_2_phl'
          },
          {
            stakeName: 'Legazpi Stake',
            stakeDB: 'legazpi_stake_phl'
          },
          {
            stakeName: 'Liloan Stake Cebu Island',
            stakeDB: 'liloan_stake_cebu_island_phl'
          },
          {
            stakeName: 'Makati Stake',
            stakeDB: 'makati_stake_phl'
          },
          {
            stakeName: 'Mandaue Stake Cebu Island',
            stakeDB: 'mandaue_stake_cebu_island_phl'
          },
          {
            stakeName: 'Mangaldan Stake',
            stakeDB: 'mangaldan_stake_phl'
          },
          {
            stakeName: 'Montalban Stake',
            stakeDB: 'montalban_stake_phl'
          },
          {
            stakeName: 'Novaliches Stake',
            stakeDB: 'novaliches_stake_phl'
          },
          {
            stakeName: 'Rosales Stake',
            stakeDB: 'rosales_stake_phl'
          },
          {
            stakeName: 'Roxas Capiz Stake',
            stakeDB: 'roxas_capiz_stake_phl'
          },
          {
            stakeName: 'Sagay Stake 1',
            stakeDB: 'sagay_stake_1_phl'
          },
          {
            stakeName: 'Sagay Stake 2',
            stakeDB: 'sagay_stake_2_phl'
          },
          {
            stakeName: 'Sipalay District',
            stakeDB: 'sipalay_district_phl'
          },
          {
            stakeName: 'Sorsogon District',
            stakeDB: 'sorsogon_district_phl'
          },
          {
            stakeName: 'Tabaco District',
            stakeDB: 'tabaco_district_phl'
          },
          {
            stakeName: 'Tagbilaran District',
            stakeDB: 'tagbilaran_district_phl'
          },
          {
            stakeName: 'Urdaneta Stake',
            stakeDB: 'urdaneta_stake_phl'
          }
        ]
      },
      {
        name: 'Sierra Leone',
        code: 'WAL',
        image: '/modules/children/client/img/sierraleone.png',
        stakes: [
          {
            stakeName: 'Makeni District',
            stakeDB: 'makeni_district_wal',
            wards: [
              {
                wardName: 'Makama'
              },
              {
                wardName: 'Teko'
              },
              {
                wardName: 'Rogbeneh'
              }
            ]
          }
        ]
      },
      {
        name: 'Zimbabwe',
        code: 'ZWE',
        image: '/modules/children/client/img/zimbabwe.png',
        stakes: [
          {
            stakeName: 'Bulawayo Stake',
            stakeDB: 'bulawayo_stake_zwe'
          },
          {
            stakeName: 'Gweru Stake',
            stakeDB: 'gweru_stake_zwe',
            wards: [
              {
                wardName: 'Mambo'
              },
              {
                wardName: 'Gweru Town'
              },
              {
                wardName: 'Mkoba 1st'
              },
              {
                wardName: 'Mkoba 2nd'
              },
              {
                wardName: 'Mkoba 3rd'
              },
              {
                wardName: 'Mkoba 5th'
              },
              {
                wardName: 'Kwekwe'
              },
              {
                wardName: 'Mbizo'
              }
            ]
          },
          {
            stakeName: 'Harare Stake',
            stakeDB: 'harare_stake_zwe'
          },
          {
            stakeName: 'Marimba Park Stake',
            stakeDB: 'marimba_park_stake_zwe'
          },
          {
            stakeName: 'Nkulumane Stake',
            stakeDB: 'nkulumane_park_stake_zwe'
          },
          {
            stakeName: 'Matare Stake',
            stakeDB: 'mutare_stake_zwe'
          },
          {
            stakeName: 'Masvingo Stake',
            stakeDB: 'masvingo_stake_zwe'
          },
          {
            stakeName: 'Zimbabwe test Only',
            stakeDB: 'test_stake_zwe'
          }
        ]
      }
    ]
  };

  function CountryInfo() {

    const returnMasterCountryList = function () {
      return masterCountryList;
    };

    const returnPilotCountyList = function () {
      return phl_pilot;
    };

    const returnCountryInfo = function(countryName) {
      return masterCountryList.countries.find(function (country) {
        return country.name === countryName;
      });
    };

    const returnCountryInfoPilot = function(countryName) {
      return phl_pilot.countries.find(function (country) {
        return country.name === countryName;
      });
    };

    return {
      getMasterList: returnMasterCountryList,
      getPhlPilotList: returnPilotCountyList,
      getCountryInfo: returnCountryInfo,
      getCountryInfoPilot: returnCountryInfoPilot
    };
  }

}());
