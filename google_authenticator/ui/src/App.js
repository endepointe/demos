import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { LockClosedIcon } from "@heroicons/react/solid"
import academicCap from "./academic-cap.svg"


function LogoutButton () {
  const { logout } = useAuth0();

  return (
    <button 
      className="m-8"
      onClick={() => logout({ returnTo: window.location.origin })}>
      Log Out
    </button>
  );
};
function Profile () {
  const { user, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    (
      <div className="m-8">
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  );
};

function Dashboard () {
  return (
    <nav className="max-w-lg w-full">
      <Profile/>
      <LogoutButton/>
    </nav>
  )
}
 
const QRCode = ({handleValidation}) => {
  const [path, setPath] = useState('');
  const [code, setCode] = useState('');
  const [exists, userExists] = useState(false);
  const { user, logout } = useAuth0();


  useEffect(() => {
    if (user) {
      fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email:user.email})
      })
      .then((res) => res.json())
      .then(data => {
        console.log(data)
        userExists(data.exists);
        setPath(data.path);
      });
    }
  }, [user]);

  const handleChange = (e) => {
    e.preventDefault();
    setCode(e.target.value);
  }

  const handleSubmit = (e) => {
    if (e.key === "Enter") {
      if (user) {
        fetch("http://localhost:5000/verify", {
          method: "POST",
          headers: {
            "Content-Type":"application/json"
          },
          body: JSON.stringify({
            email: user.email,
            passcode: code
          })
        })
        .then((res) => res.text())
        .then((data) => {
          console.log(data);
          if (data === "valid") {
            handleValidation();
            // store a credential that will persist the user for 
            // a set period of time.
          } 
          if (data === "invalid") {
            // log the user out so they have to try again
            // or give them a total of 3 tries before logging them out
            logout({ returnTo: window.location.origin });
          }
        })
      }
      setCode('');
      e.target.value = '';
    }
  }

  return (
    <>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {exists ?
            <div>
              <h3>Enter the existing QR code contained in your Google Authenticator app:</h3>
            </div> :
            <>
              <div>
                <h3>Scan the following QR code with the <a href="https://support.google.com/accounts/answer/1066447?hl=en">Google Authentictor App</a> and enter the 6-digit code below:</h3>
              </div>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="450" height="450" 
                  className="segno">
                  <path transform="scale(10)" className="qrline" stroke="#000" 
                    d={path}/>
                </svg> 
              </div>
            </>
          }
          <div>
            <input 
              onKeyDown={handleSubmit}
              onChange={handleChange}
              type="text" placeholder="6-digit code"/> 
            <button onSubmit={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </>
  )
}

function Login() {

  const { loginWithRedirect } = useAuth0();

  return (
    <>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src={academicCap}
              alt="Snowflake"
            />

            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in</h2>
          </div>
          <div className="mt-8 space-y-6">
            <button
              onClick={() => loginWithRedirect()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
              </span>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Controller function for UI management
function App() {
  const [valid, setValid] = useState(false);
  const [step, setStep] = useState(1);

  const { isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      setStep(2);
    }
    if (valid) {
      setStep(3);
    }
    console.log(step);
    // can lead to infinite chain of updates without dep arr
  }, [isAuthenticated, step,valid])

  const handleValidation = () => {
    setValid(true);
  }

  switch (step) {
    case 1:
      return (
        <Login/>
      )
    case 2:
      return (
        <div>
          <QRCode handleValidation={handleValidation}/>
        </div>
      )
    case 3:
      return (<Dashboard/>)
    default:
      return <Login/>
  }
}

export default App;
