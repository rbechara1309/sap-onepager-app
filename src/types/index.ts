export interface OnePagerRecord {
  id: string
  partner?: string
  country?: string
  sap_region?: string
  sap_sub_region_market_unit?: string
  prm_id?: string
  crm_id?: string
  partner_group_id?: string
  relationship?: string
  relationship2?: string
  relationship_with_id?: string
  relationship_with_name?: string
  relationship_with_email_id?: string
  [key: string]: string | undefined
}

export interface FilterState {
  search: string
  country: string
  sap_region: string
  relationship2: string
}
