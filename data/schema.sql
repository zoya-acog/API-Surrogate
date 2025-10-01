-- =========================
-- drugFormulations table
-- =========================
CREATE TABLE drugFormulations (
    setId TEXT,
    id TEXT PRIMARY KEY,
    versionNumber TEXT,
    splVersion TEXT,
    effectiveTime TEXT,
    publishedDate TEXT,
    title TEXT,
    brandName TEXT,
    genericName TEXT,
    manufacturerName TEXT,
    manufacturerAddress TEXT,
    dosageForm TEXT,
    routeOfAdministration TEXT,
    deaSchedule TEXT,
    marketingStatus TEXT,
    marketingStartDate TEXT,
    productCode TEXT,
    packageDescription TEXT,
    allActiveIngredients TEXT,
    inactiveIngredients TEXT,
    indicationsAndUsage TEXT,
    dosageAndAdmin TEXT,
    contraindications TEXT,
    warnings TEXT,
    precautions TEXT,
    adverseReactions TEXT,
    drugInteractions TEXT,
    howSupplied TEXT,
    storageAndHandling TEXT,
    drugAbuseAndDependence TEXT,
    infoForPatients TEXT,
    instructionsForUse TEXT,
    clinicalPharmacology TEXT,
    mechanismOfAction TEXT,
    pharmacokinetics TEXT,
    pregnancy TEXT,
    nursingMothers TEXT,
    pediatricUse TEXT,
    geriatricUse TEXT,
    documentType TEXT
);

COPY drugFormulations (setId,
    id,
    versionNumber,
    splVersion,
    effectiveTime,
    publishedDate,
    title,
    brandName,
    genericName,
    manufacturerName,
    manufacturerAddress,
    dosageForm,
    routeOfAdministration,
    deaSchedule,
    marketingStatus,
    marketingStartDate,
    productCode,
    packageDescription,
    allActiveIngredients,
    inactiveIngredients,
    indicationsAndUsage,
    dosageAndAdmin,
    contraindications,
    warnings,
    precautions,
    adverseReactions,
    drugInteractions,
    howSupplied,
    storageAndHandling,
    drugAbuseAndDependence,
    infoForPatients,
    instructionsForUse,
    clinicalPharmacology,
    mechanismOfAction,
    pharmacokinetics,
    pregnancy,
    nursingMothers,
    pediatricUse,
    geriatricUse,
    documentType)
FROM '/docker-entrypoint-initdb.d/DrugFormulations.csv'
DELIMITER ','
CSV HEADER;

-- =========================
-- compoundAPIPubchem table
-- =========================
CREATE TABLE compoundAPIPubchem (
    id INT PRIMARY KEY,
    pubChemCID BIGINT,
    molecularFormula TEXT,
    molecularWeight DOUBLE PRECISION,
    canonicalSMILES TEXT,
    isomericSMILES TEXT,
    inChI TEXT,
    inChIKey TEXT,
    xLogP DOUBLE PRECISION,
    exactMass DOUBLE PRECISION,
    monoisotopicMass DOUBLE PRECISION,
    tPSA DOUBLE PRECISION,
    complexity DOUBLE PRECISION,
    hBondDonorCount INT,
    hBondAcceptorCount INT,
    rotatableBondCount INT,
    heavyAtomCount INT,
    atomStereoCount INT,
    definedAtomStereoCount INT,
    undefinedAtomStereoCount INT,
    bondStereoCount INT,
    definedBondStereoCount INT,
    undefinedBondStereoCount INT,
    covalentUnitCount INT,
    volume3D DOUBLE PRECISION,
    xStericQuadrupole3D DOUBLE PRECISION,
    yStericQuadrupole3D DOUBLE PRECISION,
    zStericQuadrupole3D DOUBLE PRECISION,
    featureCount3D INT,
    featureAcceptorCount3D INT,
    featureDonorCount3D INT,
    featureAnionCount3D INT,
    featureCationCount3D INT,
    featureRingCount3D INT,
    featureHydrophobeCount3D INT,
    discontinued INT,
    pubChemUrl TEXT,
    saltCategory TEXT
);

COPY compoundAPIPubchem (id,
    pubChemCID,
    molecularFormula,
    molecularWeight,
    canonicalSMILES,
    isomericSMILES,
    inChI,
    inChIKey,
    xLogP,
    exactMass,
    monoisotopicMass,
    tPSA,
    complexity,
    hBondDonorCount,
    hBondAcceptorCount,
    rotatableBondCount,
    heavyAtomCount,
    atomStereoCount,
    definedAtomStereoCount,
    undefinedAtomStereoCount,
    bondStereoCount,
    definedBondStereoCount,
    undefinedBondStereoCount,
    covalentUnitCount,
    volume3D,
    xStericQuadrupole3D,
    yStericQuadrupole3D,
    zStericQuadrupole3D,
    featureCount3D,
    featureAcceptorCount3D,
    featureDonorCount3D,
    featureAnionCount3D,
    featureCationCount3D,
    featureRingCount3D,
    featureHydrophobeCount3D,
    discontinued,
    pubChemUrl,
    saltCategory )
FROM '/docker-entrypoint-initdb.d/CompoundAPIPubChem.csv'
DELIMITER ','
CSV HEADER;

-- =========================
-- drugIngredient table
-- =========================
CREATE TABLE drugIngredient (
    id INT PRIMARY KEY,
    drugId TEXT NOT NULL,
    compoundId INT NOT NULL
);
COPY drugIngredient (id,
    drugId,
    compoundId )
FROM '/docker-entrypoint-initdb.d/DrugIngredient.csv'
DELIMITER ','
CSV HEADER;

-- =========================
-- compoundAPIIdentity table
-- =========================
CREATE TABLE compoundAPIIdentity (
    id INT PRIMARY KEY,
    "name" TEXT,
    pubChemCID BIGINT UNIQUE NOT NULL,
    IUPACName TEXT,
    CAS TEXT
);
COPY compoundAPIIdentity (id,
    "name",
    pubChemCID,
    IUPACName,
    CAS )
FROM '/docker-entrypoint-initdb.d/compoundAPIIdentity.csv'
DELIMITER ','
CSV HEADER;

-- =========================
-- Synonyms
-- =========================
CREATE TABLE synonyms (
    synonym_id INT PRIMARY KEY,
    pubChemCID BIGINT NOT NULL,
    "synonym" TEXT NOT NULL
    );
    
COPY synonyms (synonym_id,
    pubChemCID,
    "synonym"
     )
FROM '/docker-entrypoint-initdb.d/synonyms.csv'
DELIMITER ','
CSV HEADER;

-- =========================
-- MeltingPoint table
-- =========================
CREATE TABLE meltingPoint (
    id INT PRIMARY KEY,
    pubChemCID BIGINT UNIQUE NOT NULL,
    minMP DOUBLE PRECISION,
    maxMP DOUBLE PRECISION,
    rangeFlag TEXT,
    mendeleyMPCelsius TEXT,
    ceMPCelsius DOUBLE PRECISION,
    harvardDataverseMinMP DOUBLE PRECISION,
    harvardDataverseMaxMP DOUBLE PRECISION,
    pubChemSource1 TEXT,
    pubChemMP1 DOUBLE PRECISION,
    pubChemSource2 TEXT,
    pubChemMP2 DOUBLE PRECISION,
    pubChemSource3 TEXT,
    pubChemMP3 DOUBLE PRECISION,
    pubChemSource4 TEXT,
    pubChemMP4 DOUBLE PRECISION,
    pubChemSource5 TEXT,
    pubChemMP5 DOUBLE PRECISION,
    pubChemSource6 TEXT,
    pubChemMP6 DOUBLE PRECISION,
    pubChemSource7 TEXT,
    pubChemMP7 DOUBLE PRECISION,
    pubChemSource8 TEXT,
    pubChemMP8 DOUBLE PRECISION,
    pubChemSource9 TEXT,
    pubChemMP9 DOUBLE PRECISION,
    pubChemSource10 TEXT,
    pubChemMP10 DOUBLE PRECISION,
    source TEXT
);
COPY meltingPoint (id,
    pubChemCID,
    minMP,
    maxMP,
    rangeFlag,
    mendeleyMPCelsius,
    ceMPCelsius,
    harvardDataverseMinMP,
    harvardDataverseMaxMP,
    pubChemSource1,
    pubChemMP1,
    pubChemSource2,
    pubChemMP2,
    pubChemSource3,
    pubChemMP3,
    pubChemSource4,
    pubChemMP4,
    pubChemSource5,
    pubChemMP5,
    pubChemSource6,
    pubChemMP6,
    pubChemSource7,
    pubChemMP7,
    pubChemSource8,
    pubChemMP8,
    pubChemSource9,
    pubChemMP9,
    pubChemSource10,
    pubChemMP10,
    source )
FROM '/docker-entrypoint-initdb.d/MeltingPoint.csv'
DELIMITER ','
CSV HEADER;

-- -- =========================
-- -- EnthalpyOfFusion
-- -- =========================
-- CREATE TABLE enthalpyoffusion (
--     id SERIAL PRIMARY KEY,
--     pubChemCID BIGINT UNIQUE NOT NULL,
--     enthalpyOfFusionMin DOUBLE PRECISION,
--     enthalpyOfFusionMax DOUBLE PRECISION,
--     CONSTRAINT fk_enthalpy_identity FOREIGN KEY (pubChemCID) REFERENCES compoundAPIIdentity (pubChemCID)
-- );

-- -- =========================
-- -- Solubilities
-- -- =========================
-- CREATE TABLE solubilities (
--     id SERIAL PRIMARY KEY,
--     pubChemCID BIGINT UNIQUE NOT NULL,
--     solubilitiesMin DOUBLE PRECISION,
--     solubilitiesMax DOUBLE PRECISION,
--     CONSTRAINT fk_solubility_identity FOREIGN KEY (pubChemCID) REFERENCES compoundAPIIdentity (pubChemCID)
-- );

-- -- =========================
-- -- PKa
-- -- =========================
-- CREATE TABLE pka (
--     id SERIAL PRIMARY KEY,
--     pubChemCID BIGINT UNIQUE NOT NULL,
--     pKaMin DOUBLE PRECISION,
--     pKaMax DOUBLE PRECISION,
--     CONSTRAINT fk_pka_identity FOREIGN KEY (pubChemCID) REFERENCES compoundAPIIdentity (pubChemCID)
-- );

-- -- =========================
-- -- Peff
-- -- =========================
-- CREATE TABLE peff (
--     id SERIAL PRIMARY KEY,
--     pubChemCID BIGINT UNIQUE NOT NULL,
--     peffMin DOUBLE PRECISION,
--     peffMax DOUBLE PRECISION,
--     CONSTRAINT fk_peff_identity FOREIGN KEY (pubChemCID) REFERENCES compoundAPIIdentity (pubChemCID)
-- );

-- -- =========================
-- -- LogD
-- -- =========================
-- CREATE TABLE logd (
--     id SERIAL PRIMARY KEY,
--     pubChemCID BIGINT UNIQUE NOT NULL,
--     logDMin DOUBLE PRECISION,
--     logDMax DOUBLE PRECISION,
--     CONSTRAINT fk_logd_identity FOREIGN KEY (pubChemCID) REFERENCES compoundAPIIdentity (pubChemCID)
-- );
