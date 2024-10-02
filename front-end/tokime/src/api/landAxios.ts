import API from '../utils/API';

export const getAllLandInfo = async () => {
  return API.get('/land')
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((e) => {
      console.log('get land Error : ', e);
      return null;
    });
};

export const getSearchLandInfo = async (
  district: string | null,
  address: string | null,
) => {
  // district와 address 중 하나라도 없으면 호출하지 않음
  if (!district || !address) {
    console.log('District or address is missing. Skipping API call.');
    return null;
  }
  return API.get('/land/search', {
    params: { district, address },
  })
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((e) => {
      console.log('land Search Error : ', e);
      return null;
    });
};

export const getLandLawInfo = async (landDistrictCode: string | null) => {
  // landDistrictCode가 없으면 호출하지 않음
  if (!landDistrictCode) {
    console.log('Land district code is missing. Skipping API call.');
    return null;
  }
  return API.get(`/land/bylaw/${landDistrictCode}`)
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((e) => {
      console.log('land Search Error : ', e);
      return null;
    });
};

export const getAllInvestLand = async () => {
  return API.get('/land/invest')
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((e) => {
      console.log('land Search Error : ', e);
      return null;
    });
};

export const getInvestDetail = async (investmentPlannedLandId: String) => {
  return API.get(`/land/invest/${investmentPlannedLandId}`)
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((e) => {
      console.log('land Search Error : ', e);
      return null;
    });
};

export const updateInvestDetail = async (
  investmentPlannedLandId: String,
  updatedData: any,
) => {
  return API.put(`/land/invest/${investmentPlannedLandId}`, updatedData)
    .then((res) => {
      console.log('Update successful: ', res.data);
      return res.data;
    })
    .catch((e) => {
      console.log('Update Error: ', e);
      return null;
    });
};

export const deleteInvestDetail = async (investmentPlannedLandId: String) => {
  return API.delete(`/land/invest/${investmentPlannedLandId}`)
    .then((res) => {
      console.log('Delete successful: ', res.data);
      return res.data;
    })
    .catch((e) => {
      console.log('Delete Error: ', e);
      return null;
    });
};
