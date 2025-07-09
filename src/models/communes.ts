type Commune = {
    code_postal: string;
    code_commune_INSEE: string;
    latitude: number;
    longitude: number;
    nom_commune_complet: string;
    code_departement: string;
    nom_departement: string;
    code_region: string;
    nom_region: string
}

type CommunesDataByCodePostal = {
    [code_postal: string]: Commune[];
}

type CommunesDataByNomCommune = {
    [nom_commune_complet: string]: Commune[];
}

export type { Commune, CommunesDataByCodePostal, CommunesDataByNomCommune }
