/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SentenceLength } from './SentenceLength';

export type UpdateRecallRequest = {
    licenceNameCategory?: UpdateRecallRequest.licenceNameCategory;
    lastReleasePrison?: string;
    lastReleaseDate?: string;
    recallEmailReceivedDateTime?: string;
    localPoliceForceId?: string;
    inCustodyAtBooking?: boolean;
    inCustodyAtAssessment?: boolean;
    contraband?: boolean;
    contrabandDetail?: string;
    vulnerabilityDiversity?: boolean;
    vulnerabilityDiversityDetail?: string;
    mappaLevel?: UpdateRecallRequest.mappaLevel;
    sentenceDate?: string;
    licenceExpiryDate?: string;
    sentenceExpiryDate?: string;
    sentencingCourt?: string;
    indexOffence?: string;
    conditionalReleaseDate?: string;
    sentenceLength?: SentenceLength;
    bookingNumber?: string;
    probationOfficerName?: string;
    probationOfficerPhoneNumber?: string;
    probationOfficerEmail?: string;
    localDeliveryUnit?: UpdateRecallRequest.localDeliveryUnit;
    authorisingAssistantChiefOfficer?: string;
    licenceConditionsBreached?: string;
    reasonsForRecall?: Array<'BREACH_EXCLUSION_ZONE' | 'ELM_BREACH_EXCLUSION_ZONE' | 'ELM_BREACH_NON_CURFEW_CONDITION' | 'ELM_FURTHER_OFFENCE' | 'ELM_EQUIPMENT_TAMPER' | 'ELM_FAILURE_CHARGE_BATTERY' | 'FAILED_HOME_VISIT' | 'FAILED_KEEP_IN_TOUCH' | 'FAILED_RESIDE' | 'FAILED_WORK_AS_APPROVED' | 'POOR_BEHAVIOUR_ALCOHOL' | 'POOR_BEHAVIOUR_FURTHER_OFFENCE' | 'POOR_BEHAVIOUR_DRUGS' | 'POOR_BEHAVIOUR_NON_COMPLIANCE' | 'POOR_BEHAVIOUR_RELATIONSHIPS' | 'TRAVELLING_OUTSIDE_UK' | 'OTHER'>;
    reasonsForRecallOtherDetail?: string;
    agreeWithRecall?: UpdateRecallRequest.agreeWithRecall;
    agreeWithRecallDetail?: string;
    currentPrison?: string;
    additionalLicenceConditions?: boolean;
    additionalLicenceConditionsDetail?: string;
    differentNomsNumber?: boolean;
    differentNomsNumberDetail?: string;
    recallNotificationEmailSentDateTime?: string;
    dossierEmailSentDate?: string;
    previousConvictionMainNameCategory?: UpdateRecallRequest.previousConvictionMainNameCategory;
    hasDossierBeenChecked?: boolean;
    previousConvictionMainName?: string;
    assessedByUserId?: string;
    bookedByUserId?: string;
    dossierCreatedByUserId?: string;
    lastKnownAddressOption?: UpdateRecallRequest.lastKnownAddressOption;
    arrestIssues?: boolean;
    arrestIssuesDetail?: string;
    warrantReferenceNumber?: string;
};

export namespace UpdateRecallRequest {

    export enum licenceNameCategory {
        FIRST_LAST = 'FIRST_LAST',
        FIRST_MIDDLE_LAST = 'FIRST_MIDDLE_LAST',
        OTHER = 'OTHER',
    }

    export enum mappaLevel {
        NA = 'NA',
        LEVEL_1 = 'LEVEL_1',
        LEVEL_2 = 'LEVEL_2',
        LEVEL_3 = 'LEVEL_3',
        NOT_KNOWN = 'NOT_KNOWN',
        CONFIRMATION_REQUIRED = 'CONFIRMATION_REQUIRED',
    }

    export enum localDeliveryUnit {
        CENTRAL_AUDIT_TEAM = 'CENTRAL_AUDIT_TEAM',
        CHANNEL_ISLANDS = 'CHANNEL_ISLANDS',
        ISLE_OF_MAN = 'ISLE_OF_MAN',
        NORTHERN_IRELAND = 'NORTHERN_IRELAND',
        NOT_APPLICABLE = 'NOT_APPLICABLE',
        NOT_SPECIFIED = 'NOT_SPECIFIED',
        PS_ACCRINGTON = 'PS_ACCRINGTON',
        PS_BARKING_DAGENHAM_HAVERING = 'PS_BARKING_DAGENHAM_HAVERING',
        PS_BARNET = 'PS_BARNET',
        PS_BARNSLEY = 'PS_BARNSLEY',
        PS_BARROW = 'PS_BARROW',
        PS_BATH_AND_NORTH_SOMERSET = 'PS_BATH_AND_NORTH_SOMERSET',
        PS_BEDFORDSHIRE = 'PS_BEDFORDSHIRE',
        PS_BEXLEY = 'PS_BEXLEY',
        PS_BIRMINGHAM_CENTRAL_AND_SOUTH = 'PS_BIRMINGHAM_CENTRAL_AND_SOUTH',
        PS_BIRMINGHAM_NORTH_AND_EAST = 'PS_BIRMINGHAM_NORTH_AND_EAST',
        PS_BLACKBURN_AND_DARWEN = 'PS_BLACKBURN_AND_DARWEN',
        PS_BLACKPOOL = 'PS_BLACKPOOL',
        PS_BOLTON = 'PS_BOLTON',
        PS_BRADFORD = 'PS_BRADFORD',
        PS_BRENT = 'PS_BRENT',
        PS_BRIGHTON_AND_EAST_SUSSEX = 'PS_BRIGHTON_AND_EAST_SUSSEX',
        PS_BRISTOL_AND_SOUTH_GLOUCESTERSHIRE = 'PS_BRISTOL_AND_SOUTH_GLOUCESTERSHIRE',
        PS_BROMLEY = 'PS_BROMLEY',
        PS_BUCKINGHAMSHIRE_M_KEYNES = 'PS_BUCKINGHAMSHIRE_M_KEYNES',
        PS_BURNLEY = 'PS_BURNLEY',
        PS_BURY = 'PS_BURY',
        PS_CALDERDALE = 'PS_CALDERDALE',
        PS_CAMBRIDGESHIRE_AND_PETERBOROUGH = 'PS_CAMBRIDGESHIRE_AND_PETERBOROUGH',
        PS_CAMDEN_ISLINGTON = 'PS_CAMDEN_ISLINGTON',
        PS_CARDIFF_AND_VALE = 'PS_CARDIFF_AND_VALE',
        PS_CARLISLE = 'PS_CARLISLE',
        PS_CHESTER = 'PS_CHESTER',
        PS_CHORLEY = 'PS_CHORLEY',
        PS_CORNWALL_AND_ISLES_OF_SCILLY = 'PS_CORNWALL_AND_ISLES_OF_SCILLY',
        PS_COVENTRY = 'PS_COVENTRY',
        PS_CREWE = 'PS_CREWE',
        PS_CROYDON = 'PS_CROYDON',
        PS_CUMBRIA = 'PS_CUMBRIA',
        PS_CWM_TAF_MORGANNWG = 'PS_CWM_TAF_MORGANNWG',
        PS_DERBY_CITY = 'PS_DERBY_CITY',
        PS_DERBYSHIRE = 'PS_DERBYSHIRE',
        PS_DEVON_AND_TORBAY = 'PS_DEVON_AND_TORBAY',
        PS_DONCASTER = 'PS_DONCASTER',
        PS_DORSET = 'PS_DORSET',
        PS_DUDLEY = 'PS_DUDLEY',
        PS_DURHAM = 'PS_DURHAM',
        PS_DYFED_POWYS = 'PS_DYFED_POWYS',
        PS_EALING = 'PS_EALING',
        PS_EAST_BERKSHIRE = 'PS_EAST_BERKSHIRE',
        PS_EAST_CHESHIRE = 'PS_EAST_CHESHIRE',
        PS_EAST_KENT = 'PS_EAST_KENT',
        PS_EAST_LANCASHIRE = 'PS_EAST_LANCASHIRE',
        PS_EAST_RIDING = 'PS_EAST_RIDING',
        PS_ENFIELD = 'PS_ENFIELD',
        PS_ESSEX_NORTH = 'PS_ESSEX_NORTH',
        PS_ESSEX_SOUTH = 'PS_ESSEX_SOUTH',
        PS_GATESHEAD = 'PS_GATESHEAD',
        PS_GLOUCESTERSHIRE = 'PS_GLOUCESTERSHIRE',
        PS_GREENWICH = 'PS_GREENWICH',
        PS_GWENT = 'PS_GWENT',
        PS_HACKNEY = 'PS_HACKNEY',
        PS_HALTON = 'PS_HALTON',
        PS_HAMMERSMITH_FULHAM = 'PS_HAMMERSMITH_FULHAM',
        PS_HAMPSHIRE_NORTH_AND_EAST = 'PS_HAMPSHIRE_NORTH_AND_EAST',
        PS_HARINGEY = 'PS_HARINGEY',
        PS_HARROW = 'PS_HARROW',
        PS_HARTLEPOOL = 'PS_HARTLEPOOL',
        PS_HEREFORDSHIRE = 'PS_HEREFORDSHIRE',
        PS_HERTFORDSHIRE = 'PS_HERTFORDSHIRE',
        PS_HILLINGDON = 'PS_HILLINGDON',
        PS_HOUNSLOW = 'PS_HOUNSLOW',
        PS_HULL = 'PS_HULL',
        PS_KENDAL = 'PS_KENDAL',
        PS_KENSINGTON_CHELSEA_WESTMINSTER = 'PS_KENSINGTON_CHELSEA_WESTMINSTER',
        PS_KINGSTON_RICHMOND = 'PS_KINGSTON_RICHMOND',
        PS_KIRKLEES = 'PS_KIRKLEES',
        PS_KNOWSLEY = 'PS_KNOWSLEY',
        PS_LAMBETH = 'PS_LAMBETH',
        PS_LANCASTER = 'PS_LANCASTER',
        PS_LEEDS = 'PS_LEEDS',
        PS_LEICESTER = 'PS_LEICESTER',
        PS_LEICESTERSHIRE_AND_RUTLAND = 'PS_LEICESTERSHIRE_AND_RUTLAND',
        PS_LEWISHAM = 'PS_LEWISHAM',
        PS_LINCOLNSHIRE_EAST = 'PS_LINCOLNSHIRE_EAST',
        PS_LINCOLNSHIRE_WEST = 'PS_LINCOLNSHIRE_WEST',
        PS_LIVERPOOL_NORTH = 'PS_LIVERPOOL_NORTH',
        PS_LIVERPOOL_SOUTH = 'PS_LIVERPOOL_SOUTH',
        PS_MACCLESFIELD = 'PS_MACCLESFIELD',
        PS_MANCHESTER_NORTH = 'PS_MANCHESTER_NORTH',
        PS_MANCHESTER_SOUTH = 'PS_MANCHESTER_SOUTH',
        PS_MERTON_SUTTON = 'PS_MERTON_SUTTON',
        PS_MIDDLESBROUGH = 'PS_MIDDLESBROUGH',
        PS_NEWCASTLE_UPON_TYNE = 'PS_NEWCASTLE_UPON_TYNE',
        PS_NEWHAM = 'PS_NEWHAM',
        PS_NORFOLK = 'PS_NORFOLK',
        PS_NORTH_DURHAM = 'PS_NORTH_DURHAM',
        PS_NORTH_EAST_LINCOLNSHIRE = 'PS_NORTH_EAST_LINCOLNSHIRE',
        PS_NORTH_LINCOLNSHIRE = 'PS_NORTH_LINCOLNSHIRE',
        PS_NORTH_TYNESIDE = 'PS_NORTH_TYNESIDE',
        PS_NORTH_WALES = 'PS_NORTH_WALES',
        PS_NORTH_YORKSHIRE = 'PS_NORTH_YORKSHIRE',
        PS_NORTHAMPTONSHIRE = 'PS_NORTHAMPTONSHIRE',
        PS_NORTHUMBERLAND = 'PS_NORTHUMBERLAND',
        PS_NORTHWICH = 'PS_NORTHWICH',
        PS_NOTTINGHAM = 'PS_NOTTINGHAM',
        PS_NOTTINGHAMSHIRE = 'PS_NOTTINGHAMSHIRE',
        PS_OLDHAM = 'PS_OLDHAM',
        PS_OXFORDSHIRE = 'PS_OXFORDSHIRE',
        PS_PENRITH = 'PS_PENRITH',
        PS_PLYMOUTH = 'PS_PLYMOUTH',
        PS_PORTSMOUTH_AND_IOW = 'PS_PORTSMOUTH_AND_IOW',
        PS_PRESTON = 'PS_PRESTON',
        PS_REDBRIDGE = 'PS_REDBRIDGE',
        PS_REDCAR_CLEVELAND = 'PS_REDCAR_CLEVELAND',
        PS_ROCHDALE = 'PS_ROCHDALE',
        PS_ROTHERHAM = 'PS_ROTHERHAM',
        PS_SALFORD = 'PS_SALFORD',
        PS_SANDWELL = 'PS_SANDWELL',
        PS_SEFTON = 'PS_SEFTON',
        PS_SHEFFIELD = 'PS_SHEFFIELD',
        PS_SHROPSHIRE = 'PS_SHROPSHIRE',
        PS_SKELMERSDALE = 'PS_SKELMERSDALE',
        PS_SOLIHULL = 'PS_SOLIHULL',
        PS_SOMERSET = 'PS_SOMERSET',
        PS_SOUTH_DURHAM = 'PS_SOUTH_DURHAM',
        PS_SOUTH_TYNESIDE = 'PS_SOUTH_TYNESIDE',
        PS_SOUTHAMPTON_EASTLEIGH_AND_NEW_FOREST = 'PS_SOUTHAMPTON_EASTLEIGH_AND_NEW_FOREST',
        PS_SOUTHWARK = 'PS_SOUTHWARK',
        PS_ST_HELENS = 'PS_ST_HELENS',
        PS_STAFFORDSHIRE = 'PS_STAFFORDSHIRE',
        PS_STOCKPORT = 'PS_STOCKPORT',
        PS_STOCKTON = 'PS_STOCKTON',
        PS_STOKE = 'PS_STOKE',
        PS_SUFFOLK = 'PS_SUFFOLK',
        PS_SUNDERLAND = 'PS_SUNDERLAND',
        PS_SURREY = 'PS_SURREY',
        PS_SWANSEA_NEATH_AND_PORT_TALBOT = 'PS_SWANSEA_NEATH_AND_PORT_TALBOT',
        PS_SWINDON_AND_WILTSHIRE = 'PS_SWINDON_AND_WILTSHIRE',
        PS_TAMESIDE = 'PS_TAMESIDE',
        PS_TELFORD = 'PS_TELFORD',
        PS_TOWER_HAMLETS = 'PS_TOWER_HAMLETS',
        PS_TRAFFORD = 'PS_TRAFFORD',
        PS_WAKEFIELD = 'PS_WAKEFIELD',
        PS_WALSALL = 'PS_WALSALL',
        PS_WALTHAM_FOREST = 'PS_WALTHAM_FOREST',
        PS_WANDSWORTH = 'PS_WANDSWORTH',
        PS_WARRINGTON = 'PS_WARRINGTON',
        PS_WARWICKSHIRE = 'PS_WARWICKSHIRE',
        PS_WEST_BERKSHIRE = 'PS_WEST_BERKSHIRE',
        PS_WEST_CHESHIRE = 'PS_WEST_CHESHIRE',
        PS_WEST_KENT = 'PS_WEST_KENT',
        PS_WEST_SUSSEX = 'PS_WEST_SUSSEX',
        PS_WIGAN = 'PS_WIGAN',
        PS_WIRRAL = 'PS_WIRRAL',
        PS_WOLVERHAMPTON = 'PS_WOLVERHAMPTON',
        PS_WORCESTERSHIRE = 'PS_WORCESTERSHIRE',
        PS_WORKINGTON = 'PS_WORKINGTON',
        PS_YORK = 'PS_YORK',
        REGIONAL_CT_ADMIN = 'REGIONAL_CT_ADMIN',
        REPUBLIC_OF_IRELAND = 'REPUBLIC_OF_IRELAND',
        SCOTLAND = 'SCOTLAND',
        YOT_SEE_COMMENTS = 'YOT_SEE_COMMENTS',
    }

    export enum agreeWithRecall {
        YES = 'YES',
        NO_STOP = 'NO_STOP',
    }

    export enum previousConvictionMainNameCategory {
        FIRST_LAST = 'FIRST_LAST',
        FIRST_MIDDLE_LAST = 'FIRST_MIDDLE_LAST',
        OTHER = 'OTHER',
    }

    export enum lastKnownAddressOption {
        YES = 'YES',
        NO_FIXED_ABODE = 'NO_FIXED_ABODE',
    }


}
