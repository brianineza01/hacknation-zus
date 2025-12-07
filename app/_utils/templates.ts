export const templates = [
  {
    id_pl: "zawiadomienie_o_wypadku",
    id_en: "accident_notification",
    description_pl:
      "Zgłoszenie wypadku osoby prowadzącej pozarolniczą działalność gospodarczą do ZUS.",
    description_en:
      "Accident notification for a person conducting non-agricultural business activity to ZUS.",
    label_pl: "Zawiadomienie o wypadku przy pracy",
    label_en: "Notification of an Accident at Work",
    sections: [
      {
        id_pl: "dane_poszkodowanego",
        id_en: "victim_data",
        label_pl: "Twoje dane jako osoby poszkodowanej",
        label_en: "Your Data as the Injured Person",
        description_pl: "Dane identyfikacyjne osoby, która uległa wypadkowi.",
        description_en:
          "Identification data of the person who suffered the accident.",
        fields: [
          {
            id_pl: "pesel",
            id_en: "pesel",
            label_pl: "PESEL",
            label_en: "PESEL Number",
            description_pl:
              "Numer Powszechnego Elektronicznego Systemu Ewidencji Ludności.",
            description_en: "Personal Identity Number.",
          },
          {
            id_pl: "dokument_tozsamosci",
            id_en: "identity_document",
            label_pl:
              "Rodzaj, seria i numer dokumentu potwierdzającego tożsamość",
            label_en: "Type, Series, and Number of Identity Document",
            description_pl: "Szczegóły dokumentu tożsamości.",
            description_en: "Details of the identity document.",
          },
          {
            id_pl: "imie_nazwisko",
            id_en: "full_name",
            label_pl: "Imię i nazwisko",
            label_en: "First and Last Name",
            description_pl: "Pełne imię i nazwisko poszkodowanego.",
            description_en: "Full name of the injured person.",
          },
          {
            id_pl: "data_urodzenia",
            id_en: "date_of_birth",
            label_pl: "Data urodzenia",
            label_en: "Date of Birth",
            description_pl: "Data urodzenia poszkodowanego.",
            description_en: "Date of birth of the injured person.",
          },
          {
            id_pl: "miejsce_urodzenia",
            id_en: "place_of_birth",
            label_pl: "Miejsce urodzenia",
            label_en: "Place of Birth",
            description_pl: "Miejsce urodzenia poszkodowanego.",
            description_en: "Place of birth of the injured person.",
          },
          {
            id_pl: "numer_telefonu",
            id_en: "phone_number",
            label_pl: "Numer telefonu",
            label_en: "Phone Number",
            description_pl: "Numer telefonu dla sprawniejszego kontaktu.",
            description_en: "Phone number for easier contact.",
          },
        ],
      },
      {
        id_pl: "adres_zamieszkania",
        id_en: "residential_address",
        label_pl: "Twój adres zamieszkania jako osoby poszkodowanej",
        label_en: "Your Residential Address as the Injured Person",
        description_pl: "Aktualny adres zamieszkania poszkodowanego.",
        description_en: "Current residential address of the injured person.",
        fields: [
          {
            id_pl: "ulica_dom_lokal",
            id_en: "street_house_apt",
            label_pl: "Ulica, numer domu, numer lokalu",
            label_en: "Street, House Number, Apartment Number",
            description_pl: "Szczegóły adresu ulicznego.",
            description_en: "Street address details.",
          },
          {
            id_pl: "kod_miejscowosc_panstwo",
            id_en: "zip_city_country",
            label_pl: "Kod pocztowy, miejscowość, nazwa państwa",
            label_en: "Zip Code, City, Country Name",
            description_pl:
              "Kod pocztowy, miasto oraz państwo (jeśli adres jest poza Polską).",
            description_en:
              "Zip code, city, and country (if the address is outside Poland).",
          },
        ],
      },
      {
        id_pl: "adres_ostatniego_pobytu",
        id_en: "last_residence_address",
        label_pl: "Adres ostatniego miejsca zamieszkania lub pobytu w Polsce",
        label_en: "Address of Last Residence or Stay in Poland",
        description_pl:
          "Adres dla osób mieszkających za granicą lub nieposiadających adresu zamieszkania.",
        description_en:
          "Address for persons living abroad or without a permanent residence.",
        fields: [
          {
            id_pl: "ulica_dom_lokal_ost",
            id_en: "street_house_apt_last",
            label_pl: "Ulica, numer domu, numer lokalu",
            label_en: "Street, House Number, Apartment Number",
            description_pl: "Szczegóły adresu ulicznego.",
            description_en: "Street address details.",
          },
          {
            id_pl: "kod_miejscowosc_ost",
            id_en: "zip_city_last",
            label_pl: "Kod pocztowy, miejscowość",
            label_en: "Zip Code, City",
            description_pl: "Kod pocztowy i miejscowość.",
            description_en: "Zip code and city.",
          },
        ],
      },
      {
        id_pl: "adres_korespondencyjny",
        id_en: "correspondence_address",
        label_pl: "Adres do korespondencji",
        label_en: "Correspondence Address",
        description_pl:
          "Adres, na który ZUS ma wysyłać korespondencję, jeśli jest inny niż zamieszkania.",
        description_en:
          "Address where ZUS should send correspondence if different from residence.",
        fields: [
          {
            id_pl: "typ_adresu",
            id_en: "address_type",
            label_pl: "Typ adresu (Adres / Poste Restante / Skrytka pocztowa)",
            label_en: "Address Type (Address / Poste Restante / PO Box)",
            description_pl: "Wybór rodzaju adresu do korespondencji.",
            description_en: "Selection of the type of correspondence address.",
          },
          {
            id_pl: "szczegoly_adresu",
            id_en: "address_details",
            label_pl: "Szczegóły adresu",
            label_en: "Address Details",
            description_pl:
              "Dane zależne od typu (ulica/dom dla adresu; kod/placówka dla poste restante; nr skrytki dla skrytki).",
            description_en:
              "Data depending on type (street/house for address; code/office for poste restante; box no for PO Box).",
          },
        ],
      },
      {
        id_pl: "adres_dzialalnosci",
        id_en: "business_address",
        label_pl: "Adres prowadzenia działalności gospodarczej",
        label_en: "Business Activity Address",
        description_pl: "Adres, pod którym prowadzona jest działalność.",
        description_en: "Address where the business activity is conducted.",
        fields: [
          {
            id_pl: "ulica_dom_lokal_dzial",
            id_en: "street_house_apt_bus",
            label_pl: "Ulica, numer domu, numer lokalu",
            label_en: "Street, House Number, Apartment Number",
            description_pl: "Adres uliczny działalności.",
            description_en: "Street address of the business.",
          },
          {
            id_pl: "kod_miejscowosc_dzial",
            id_en: "zip_city_bus",
            label_pl: "Kod pocztowy, miejscowość",
            label_en: "Zip Code, City",
            description_pl: "Kod pocztowy i miasto działalności.",
            description_en: "Zip code and city of the business.",
          },
          {
            id_pl: "telefon_kontaktowy",
            id_en: "contact_phone",
            label_pl: "Numer telefonu",
            label_en: "Phone Number",
            description_pl: "Opcjonalny numer telefonu dla kontaktu.",
            description_en: "Optional phone number for contact.",
          },
        ],
      },
      {
        id_pl: "dane_zglaszajacego",
        id_en: "applicant_data",
        label_pl: "Dane osoby zawiadamiającej (jeśli inna niż poszkodowany)",
        label_en: "Applicant Data (if different from victim)",
        description_pl:
          "Dane pełnomocnika lub innej osoby zgłaszającej wypadek.",
        description_en:
          "Data of the proxy or other person reporting the accident.",
        fields: [
          {
            id_pl: "pesel_zglaszajacego",
            id_en: "applicant_pesel",
            label_pl: "PESEL",
            label_en: "PESEL Number",
            description_pl: "PESEL osoby zgłaszającej.",
            description_en: "PESEL of the applicant.",
          },
          {
            id_pl: "dok_toz_zglaszajacego",
            id_en: "applicant_identity_doc",
            label_pl: "Dokument tożsamości",
            label_en: "Identity Document",
            description_pl:
              "Rodzaj, seria i numer dokumentu (jeśli brak PESEL).",
            description_en:
              "Type, series, and number of document (if no PESEL).",
          },
          {
            id_pl: "imie_nazwisko_zglaszajacego",
            id_en: "applicant_name",
            label_pl: "Imię i nazwisko",
            label_en: "First and Last Name",
            description_pl: "Imię i nazwisko osoby zgłaszającej.",
            description_en: "First and last name of the applicant.",
          },
          {
            id_pl: "data_ur_zglaszajacego",
            id_en: "applicant_dob",
            label_pl: "Data urodzenia",
            label_en: "Date of Birth",
            description_pl: "Data urodzenia osoby zgłaszającej.",
            description_en: "Date of birth of the applicant.",
          },
          {
            id_pl: "telefon_zglaszajacego",
            id_en: "applicant_phone",
            label_pl: "Numer telefonu",
            label_en: "Phone Number",
            description_pl: "Opcjonalny numer telefonu.",
            description_en: "Optional phone number.",
          },
          {
            id_pl: "adres_zglaszajacego",
            id_en: "applicant_address",
            label_pl: "Adres zamieszkania",
            label_en: "Residential Address",
            description_pl: "Pełny adres zamieszkania osoby zgłaszającej.",
            description_en: "Full residential address of the applicant.",
          },
        ],
      },
      {
        id_pl: "informacje_o_wypadku",
        id_en: "accident_info",
        label_pl: "Informacje, które dotyczą wypadku",
        label_en: "Information Regarding the Accident",
        description_pl:
          "Szczegóły dotyczące czasu, miejsca i okoliczności zdarzenia.",
        description_en:
          "Details regarding the time, place, and circumstances of the event.",
        fields: [
          {
            id_pl: "data_godzina_wypadku",
            id_en: "accident_date_time",
            label_pl: "Data i godzina wypadku",
            label_en: "Date and Time of Accident",
            description_pl: "Kiedy doszło do zdarzenia.",
            description_en: "When the event occurred.",
          },
          {
            id_pl: "miejsce_wypadku",
            id_en: "accident_place",
            label_pl: "Miejsce wypadku",
            label_en: "Place of Accident",
            description_pl: "Lokalizacja, w której wydarzył się wypadek.",
            description_en: "Location where the accident happened.",
          },
          {
            id_pl: "planowane_godziny_pracy",
            id_en: "planned_work_hours",
            label_pl: "Godziny pracy (planowane rozpoczęcie i zakończenie)",
            label_en: "Work Hours (Planned Start and End)",
            description_pl:
              "Godziny, w których poszkodowany planował pracować w dniu wypadku.",
            description_en:
              "Hours the victim planned to work on the day of the accident.",
          },
          {
            id_pl: "rodzaj_urazow",
            id_en: "injury_types",
            label_pl: "Rodzaj urazów",
            label_en: "Types of Injuries",
            description_pl: "Opis obrażeń doznanych wskutek wypadku.",
            description_en:
              "Description of injuries sustained due to the accident.",
          },
          {
            id_pl: "opis_okolicznosci_przyczyn",
            id_en: "circumstances_causes_desc",
            label_pl: "Szczegółowy opis okoliczności i przyczyn",
            label_en: "Detailed Description of Circumstances and Causes",
            description_pl: "Jak doszło do wypadku i dlaczego.",
            description_en: "How the accident happened and why.",
          },
          {
            id_pl: "opis_miejsca",
            id_en: "place_description",
            label_pl: "Opis miejsca wypadku",
            label_en: "Description of Accident Place",
            description_pl: "Charakterystyka miejsca zdarzenia.",
            description_en: "Characteristics of the accident scene.",
          },
          {
            id_pl: "pierwsza_pomoc",
            id_en: "first_aid_info",
            label_pl: "Pierwsza pomoc (nazwa i adres placówki)",
            label_en: "First Aid (Name and Address of Facility)",
            description_pl: "Informacje o udzielonej pomocy medycznej.",
            description_en: "Information about provided medical aid.",
          },
          {
            id_pl: "postepowanie_organow",
            id_en: "official_proceedings",
            label_pl: "Postępowanie organów (nazwa i adres)",
            label_en: "Official Proceedings (Name and Address)",
            description_pl:
              "Informacje o postępowaniu np. policji lub prokuratury.",
            description_en:
              "Information about proceedings by e.g., police or prosecutor.",
          },
          {
            id_pl: "maszyny_urzadzenia",
            id_en: "machinery_devices",
            label_pl: "Obsługa maszyn/urządzeń",
            label_en: "Operation of Machinery/Devices",
            description_pl:
              "Czy wypadek powstał podczas obsługi maszyn, ich sprawność i sposób użycia.",
            description_en:
              "Whether the accident occurred while operating machinery, its condition and usage.",
          },
          {
            id_pl: "atest_maszyny",
            id_en: "machinery_atest",
            label_pl: "Atest/ewidencja maszyn",
            label_en: "Machinery Certificate/Registry",
            description_pl:
              "Czy maszyna posiadała atest i była w ewidencji środków trwałych.",
            description_en:
              "Whether the machine had a certificate and was in the fixed assets register.",
          },
        ],
      },
      {
        id_pl: "swiadkowie",
        id_en: "witnesses",
        label_pl: "Dane świadków",
        label_en: "Witness Data",
        description_pl:
          "Dane osób, które widziały wypadek lub mają o nim wiedzę.",
        description_en:
          "Data of persons who saw the accident or have knowledge of it.",
        fields: [
          {
            id_pl: "imie_nazwisko_swiadka",
            id_en: "witness_name",
            label_pl: "Imię i nazwisko",
            label_en: "First and Last Name",
            description_pl: "Dane osobowe świadka.",
            description_en: "Personal data of the witness.",
          },
          {
            id_pl: "adres_swiadka",
            id_en: "witness_address",
            label_pl: "Adres zamieszkania",
            label_en: "Residential Address",
            description_pl: "Pełny adres zamieszkania świadka.",
            description_en: "Full residential address of the witness.",
          },
        ],
      },
    ],
  },
  {
    id_pl: "zapis_wyjasnien_poszkodowanego",
    id_en: "victim_explanation_record",
    description_pl:
      "Dokument zawierający szczegółowe wyjaśnienia poszkodowanego na temat przebiegu wypadku.",
    description_en:
      "Document containing detailed explanations from the victim regarding the course of the accident.",
    label_pl: "Zapis wyjaśnień poszkodowanego",
    label_en: "Record of Victim's Explanations",
    sections: [
      {
        id_pl: "dane_i_czas",
        id_en: "data_and_time",
        label_pl: "Dane i czas zdarzenia",
        label_en: "Data and Time of Event",
        description_pl: "Podstawowe dane o zdarzeniu i poszkodowanym.",
        description_en: "Basic data about the event and the victim.",
        fields: [
          {
            id_pl: "dane_poszkodowanego_wyj",
            id_en: "victim_data_exp",
            label_pl: "Dane poszkodowanego",
            label_en: "Victim Data",
            description_pl: "Dane identyfikacyjne składającego wyjaśnienia.",
            description_en:
              "Identification data of the person submitting explanations.",
          },
          {
            id_pl: "data_miejsce_godzina",
            id_en: "date_place_time",
            label_pl: "Data, miejsce i godzina wypadku",
            label_en: "Date, Place, and Time of Accident",
            description_pl: "Szczegóły czasowe i lokalizacyjne.",
            description_en: "Time and location details.",
          },
          {
            id_pl: "planowane_godziny",
            id_en: "planned_hours",
            label_pl: "Planowana godzina rozpoczęcia i zakończenia pracy",
            label_en: "Planned Start and End Time of Work",
            description_pl: "Harmonogram pracy w dniu wypadku.",
            description_en: "Work schedule on the day of the accident.",
          },
        ],
      },
      {
        id_pl: "przebieg_zdarzenia",
        id_en: "event_course",
        label_pl: "Przebieg i okoliczności zdarzenia",
        label_en: "Course and Circumstances of the Event",
        description_pl: "Opis czynności i faktów prowadzących do wypadku.",
        description_en:
          "Description of activities and facts leading to the accident.",
        fields: [
          {
            id_pl: "rodzaj_czynnosci",
            id_en: "activity_type",
            label_pl: "Rodzaj wykonywanych czynności",
            label_en: "Type of Activities Performed",
            description_pl:
              "Czynności wykonywane do momentu wypadku związane z działalnością.",
            description_en:
              "Activities performed up to the moment of the accident related to the business.",
          },
          {
            id_pl: "okolicznosci_przyczyny",
            id_en: "circumstances_causes",
            label_pl: "Okoliczności i przyczyny wypadku",
            label_en: "Circumstances and Causes of Accident",
            description_pl:
              "Szczegółowy opis, jak i dlaczego doszło do zdarzenia.",
            description_en:
              "Detailed description of how and why the event occurred.",
          },
          {
            id_pl: "maszyny_narzedzia_szczegoly",
            id_en: "machinery_tools_details",
            label_pl: "Szczegóły maszyn/narzędzi",
            label_en: "Machinery/Tools Details",
            description_pl:
              "Nazwa, typ, data produkcji, sprawność, zgodność użytkowania.",
            description_en:
              "Name, type, production date, condition, usage compliance.",
          },
          {
            id_pl: "zabezpieczenia",
            id_en: "safety_measures",
            label_pl: "Stosowane zabezpieczenia",
            label_en: "Safety Measures Used",
            description_pl: "Rodzaj środków (kask, buty itp.) i ich sprawność.",
            description_en:
              "Type of measures (helmet, shoes, etc.) and their condition.",
          },
          {
            id_pl: "asekuracja_wspolpraca",
            id_en: "asecuration_cooperation",
            label_pl: "Asekuracja i praca zespołowa",
            label_en: "Asecuration and Teamwork",
            description_pl:
              "Czy stosowano asekurację, czy praca wymagała dwóch osób.",
            description_en:
              "Whether asecuration was used, if the job required two people.",
          },
          {
            id_pl: "przestrzeganie_bhp",
            id_en: "bhp_compliance",
            label_pl: "Przestrzeganie zasad BHP",
            label_en: "Compliance with BHP Rules",
            description_pl:
              "Oświadczenie o przestrzeganiu zasad bezpieczeństwa.",
            description_en: "Statement on compliance with safety rules.",
          },
        ],
      },
      {
        id_pl: "kwalifikacje_i_stan",
        id_en: "qualifications_and_state",
        label_pl: "Kwalifikacje, stan psychofizyczny i inne",
        label_en: "Qualifications, Psychophysical State and Others",
        description_pl: "Przygotowanie do pracy i stan w chwili wypadku.",
        description_en:
          "Preparation for work and state at the moment of the accident.",
        fields: [
          {
            id_pl: "przygotowanie_zawodowe",
            id_en: "vocational_preparation",
            label_pl: "Przygotowanie zawodowe",
            label_en: "Vocational Preparation",
            description_pl:
              "Czy poszkodowany posiadał przygotowanie do wykonywania zadań.",
            description_en:
              "Whether the victim was prepared to perform the tasks.",
          },
          {
            id_pl: "szkolenia_bhp_ryzyko",
            id_en: "bhp_training_risk",
            label_pl: "Szkolenia BHP i ocena ryzyka",
            label_en: "BHP Training and Risk Assessment",
            description_pl:
              "Informacja o szkoleniach i ocenie ryzyka zawodowego.",
            description_en:
              "Information about training and occupational risk assessment.",
          },
          {
            id_pl: "stan_trzezwosci",
            id_en: "sobriety_status",
            label_pl: "Stan trzeźwości",
            label_en: "Sobriety Status",
            description_pl: "Informacje o trzeźwości i ewentualnych badaniach.",
            description_en: "Information about sobriety and potential tests.",
          },
          {
            id_pl: "czynnosci_wyjasniajace",
            id_en: "explanatory_actions",
            label_pl: "Czynności wyjaśniające organów",
            label_en: "Official Explanatory Actions",
            description_pl:
              "Działania policji, inspekcji pracy itp. (numer sprawy, status).",
            description_en:
              "Actions by police, labor inspection, etc. (case number, status).",
          },
          {
            id_pl: "szczegoly_pomocy_medycznej",
            id_en: "medical_aid_details",
            label_pl: "Szczegóły pomocy medycznej",
            label_en: "Medical Aid Details",
            description_pl: "Data, placówka, hospitalizacja, rozpoznany uraz.",
            description_en:
              "Date, facility, hospitalization, diagnosed injury.",
          },
          {
            id_pl: "zwolnienie_lekarskie",
            id_en: "sick_leave",
            label_pl: "Zwolnienie lekarskie",
            label_en: "Sick Leave",
            description_pl:
              "Czy w dniu wypadku poszkodowany przebywał na zwolnieniu.",
            description_en:
              "Whether the victim was on sick leave on the day of the accident.",
          },
        ],
      },
    ],
  },
  {
    id_pl: "zapis_informacji_od_swiadka",
    id_en: "witness_statement_record",
    description_pl:
      "Dokument zawierający informacje o zdarzeniu od świadka lub członka rodziny.",
    description_en:
      "Document containing information about the event from a witness or family member.",
    label_pl: "Zapis informacji od świadka wypadku / członka rodziny",
    label_en: "Record of Information from Accident Witness / Family Member",
    fields: [
      {
        id_pl: "dane_swiadka",
        id_en: "witness_data_stm",
        label_pl: "Dane świadka / członka rodziny",
        label_en: "Witness / Family Member Data",
        description_pl: "Dane identyfikacyjne osoby składającej oświadczenie.",
        description_en:
          "Identification data of the person submitting the statement.",
      },
      {
        id_pl: "dane_poszkodowanego_stm",
        id_en: "victim_data_stm",
        label_pl: "Dane poszkodowanego",
        label_en: "Victim Data",
        description_pl: "Dane osoby, której wypadek dotyczy.",
        description_en: "Data of the person whom the accident concerns.",
      },
      {
        id_pl: "data_zdarzenia",
        id_en: "event_date",
        label_pl: "Data zdarzenia",
        label_en: "Date of Event",
        description_pl: "Data zdarzenia, którego dotyczy informacja.",
        description_en: "Date of the event the information concerns.",
      },
      {
        id_pl: "opis_zdarzenia",
        id_en: "event_description",
        label_pl: "Opis zdarzenia",
        label_en: "Description of Event",
        description_pl: "Opis faktów znanych świadkowi.",
        description_en: "Description of facts known to the witness.",
      },
    ],
  },
];
