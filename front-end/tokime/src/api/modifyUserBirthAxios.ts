import API from '../utils/API';

export default async function modifyUserBirthAxios(birth: string) {
  return API.put(`/user?birth=${birth}`)
    .then((res) => {
      return res.data.data[0].birth;
    })
    .catch((e) => {
      console.log(e);
      console.log('Error Handling');
      return null;
    });
}
