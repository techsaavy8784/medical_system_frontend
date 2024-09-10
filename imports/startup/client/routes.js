import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap/dist/css/bootstrap.css";

import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from "meteor/session";

import "/client/main.html";
import "/imports/ui/common/loading/loading";
import "/imports/ui/login/login";
import "/imports/ui/home/home";
import "/imports/ui/common/header/header";
import "/imports/ui/patients/findPatient/findPatient";
import "/imports/ui/patients/currentPatient/currentPatient";
import "/imports/ui/common/patientMatchModal/patientMatchModal";
import "/imports/ui/common/adjustFiltersModal/adjustFiltersModal";

//Document Reference
import "/imports/ui/resources/DocumentReference/DocumentReferenceSearchModal/DocumentReferenceSearchModal";
import "/imports/ui/resources/DocumentReference/DocumentReferenceSaveModal/DocumentReferenceSaveModal";

//Diagnostic Report
import "/imports/ui/resources/DiagnosticReport/DiagnosticReportSearchModal/DiagnosticReportSearchModal";
import "/imports/ui/resources/DiagnosticReport/DiagnosticReportSaveModal/DiagnosticReportSaveModal";

//Observation
import "/imports/ui/resources/Observation/ObservationSearchModal/ObservationSearchModal";
import "/imports/ui/resources/Observation/ObservationSaveModal/ObservationSaveModal";

//QuestionnaireResponse
import "/imports/ui/resources/QuestionnaireResponse/QuestionnaireResponseSearchModal/QuestionnaireResponseSearchModal";
import "/imports/ui/resources/QuestionnaireResponse/QuestionnaireResponseSaveModal/QuestionnaireResponseSaveModal";

//Immunization
import "/imports/ui/resources/Immunization/ImmunizationSearchModal/ImmunizationSearchModal";
import "/imports/ui/resources/Immunization/ImmunizationSaveModal/ImmunizationSaveModal";

//Condition
import "/imports/ui/resources/Condition/ConditionSearchModal/ConditionSearchModal";
import "/imports/ui/resources/Condition/ConditionSaveModal/ConditionSaveModal";

//Procedures
import "/imports/ui/resources/Procedures/ProceduresSearchModal/ProceduresSearchModal";
import "/imports/ui/resources/Procedures/ProceduresSaveModal/ProceduresSaveModal";

//Account
import "/imports/ui/resources/Account/AccountSearchModal/AccountSearchModal";
import "/imports/ui/resources/Account/AccountSaveModal/AccountSaveModal";

//AllergyIntolerance
import "/imports/ui/resources/AllergyIntolerance/AllergyIntoleranceSearchModal/AllergyIntoleranceSearchModal";
import "/imports/ui/resources/AllergyIntolerance/AllergyIntoleranceSaveModal/AllergyIntoleranceSaveModal";

//CarePlan
import "/imports/ui/resources/CarePlan/CarePlanSearchModal/CarePlanSearchModal";
import "/imports/ui/resources/CarePlan/CarePlanSaveModal/CarePlanSaveModal";

//CareTeam
import "/imports/ui/resources/CareTeam/CareTeamSearchModal/CareTeamSearchModal";
import "/imports/ui/resources/CareTeam/CareTeamSaveModal/CareTeamSaveModal";

//Coverage
import "/imports/ui/resources/Coverage/CoverageSearchModal/CoverageSearchModal";
import "/imports/ui/resources/Coverage/CoverageSaveModal/CoverageSaveModal";

//Device
import "/imports/ui/resources/Device/DeviceSearchModal/DeviceSearchModal";
import "/imports/ui/resources/Device/DeviceSaveModal/DeviceSaveModal";

//Encounter
import "/imports/ui/resources/Encounter/EncounterSearchModal/EncounterSearchModal";
import "/imports/ui/resources/Encounter/EncounterSaveModal/EncounterSaveModal";

//Goal
import "/imports/ui/resources/Goal/GoalSearchModal/GoalSearchModal";
import "/imports/ui/resources/Goal/GoalSaveModal/GoalSaveModal";

//MedicationAdministration
import "/imports/ui/resources/MedicationAdministration/MedicationAdministrationSearchModal/MedicationAdministrationSearchModal";
import "/imports/ui/resources/MedicationAdministration/MedicationAdministrationSaveModal/MedicationAdministrationSaveModal";

//MedicationDispense
import "/imports/ui/resources/MedicationDispense/MedicationDispenseSearchModal/MedicationDispenseSearchModal";
import "/imports/ui/resources/MedicationDispense/MedicationDispenseSaveModal/MedicationDispenseSaveModal";

//MedicationRequest
import "/imports/ui/resources/MedicationRequest/MedicationRequestSearchModal/MedicationRequestSearchModal";
import "/imports/ui/resources/MedicationRequest/MedicationRequestSaveModal/MedicationRequestSaveModal";


//NutritionOrder
import "/imports/ui/resources/NutritionOrder/NutritionOrderSearchModal/NutritionOrderSearchModal";
import "/imports/ui/resources/NutritionOrder/NutritionOrderSaveModal/NutritionOrderSaveModal";


//view Patient
import "/imports/ui/common/viewPatient/viewPatient";

//data pending
import "/imports/ui/pending/pending";

FlowRouter.route('/', {
    name: 'uc.home',
    action() {
        this.render('mainContainer', 'home');
    }
});

FlowRouter.route('/login', {
    name: 'uc.login',
    action() {
        this.render('mainContainer', 'login');
    }
});

FlowRouter.route('/find-patient', {
    name: 'uc.findPatient',
    action() {
        Session.set("getPatientDocs", null);
        Session.set("getLocalPatientDocs", null);
        const isLogin = Session.get("isLogin");
        if(!isLogin) {
            FlowRouter.go('/login');
        } else {
            this.render('mainContainer', 'findPatient');
        }
    }
});

//any params with ? in flowRouter handled as optional params like :id?
// so below router code works for both /current-patient and /current-patient/id
FlowRouter.route('/current-patient/:_id?', {
    name: 'uc.currentPatient',
    action() {
        const isLogin = Session.get("isLogin");
        if(!isLogin) {
            FlowRouter.go('/login');
        } else {
            this.render('mainContainer', 'currentPatient');
        }
    }
});


FlowRouter.route('/pending', {
    name: 'uc.updates',
    action() {
        const isLogin = Session.get("isLogin");
        if(!isLogin) {
            FlowRouter.go('/login');
        } else {
            this.render('mainContainer', 'pending');
        }
    }
});

//if Route not found just redirect to homePage
FlowRouter.route('*', {
    action: function() {
        FlowRouter.go('/')
    }
})
