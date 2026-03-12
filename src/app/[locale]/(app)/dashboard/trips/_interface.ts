export interface PackageType {
  company_id: string;
  created: string;
  package_id: string;
  cover_photo: string[];
  geo_hash: string;
  title: string;
  description: string;
  departure_city: string;
  departure_state: string;
  departure_country: string;
  arrival_city: string;
  arrival_state: string;
  arrival_country: string;
  duration: string;
  services: string;
  package_for: number;
  package_price: number;
  lat: number;
  long: number;
  company_created: string;
  company_user_id: string;
}

export interface PackagePaginationResponse {
  packages: PackageType[];
  nextSearchAfter: string[];
  total: number;
}

export interface GetPackagesByGeoType {
  getPackagesByGeo: PackagePaginationResponse;
}

export interface GetPackagesByGeoVariablesType {
  latitude: number;
  longitude: number;
  size?: number;
  searchAfter?: string[];
}

export interface GetCompanyPackageType {
  getCompanyPackage: PackageType;
}

export interface GetCompanyPackageVariablesType {
  company_id: string;
  created: string;
}

// Brand / Company types
export interface CompanyType {
  company_id: string;
  user_id: string;
  created: string;
  name: string;
  slogan: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  photo_profile: string;
  cover_photo: string;
  video_url: string;
  video_title: string;
  video_thumbnail: string;
  geo_hash: string;
  company_address: string;
  company_postal_code: string;
  company_city: string;
  company_state: string;
  company_country: string;
  mobile_country_code: string;
  mobile_country_flag: string;
}

export interface GetSingleCompanyByUserType {
  getsingleCompanyByUser: CompanyType;
}

export interface GetSingleCompanyByUserVariablesType {
  user_id: string;
  created: string;
}

export interface GetCompanyPackagesType {
  getCompanyPackages: PackageType[];
}

export interface GetCompanyPackagesVariablesType {
  company_id: string;
  page: number;
}

export interface CreateConsultRequestInput {
  company_id: string;
  company_user_id: string;
  email: string;
  phone: string;
  query: string;
  date: string;
  name: string;
  country_code: string;
  country_flag: string;
  company_created: string;
  company_name: string;
  company_address: string;
  company_email: string;
}

export interface CreateConsultRequestType {
  createConsultRequest: boolean;
}

export interface CreateTripRequestInput {
  company_onwer_user_id: string;
  company_id: string;
  package_id: string;
  package_created: string;
  email: string;
  phone: string;
  address: string;
  departure_address: string;
  arrival_address: string;
  departure_time: string;
  status: string;
  addults: number;
  childs: number;
  date: string;
  name: string;
  country_code: string;
  country_flag: string;
  company_created: string;
  package_name: string;
}

export interface CreateTripRequestType {
  createTripRequest: boolean;
}
