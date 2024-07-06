import { useRouter } from 'next/navigation';

const GetClub = ({ club }) => {

  // Access the query parameters
  const router = useRouter();
  console.log(club);

  // Access the query parameters


  return (
    <>
      {club}
    </>
  )
}

export default GetClub
