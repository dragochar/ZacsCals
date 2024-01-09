import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { loginOrSignup, verifyCode, authenticateToken, finishProfile } from './api/index';
import Confetti from 'react-confetti';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showEnterAccessCode, setShowEnterAccessCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pageState, setPageState] = useState('Loading');
  const [myName, setMyName] = useState('');
  const [myProteinGoal, setMyProteinGoal] = useState('');
  const [myCalorieGoal, setMyCalorieGoal] = useState('');
  const [myGangId, setMyGangId] = useState('');
  const [user, setUser] = useState<any>({});
  const [currentTime, setCurrentTime] = useState('');

  const mealsEaten = [];

  useEffect(() => {

    const onLoad = async () => {

      const localToken = await localStorage.getItem('token');
      if (localToken) {
        const response = await authenticateToken(localToken);
        if (response.user) {
          setUser(response?.user);
          if (response?.user.isComplete === true) {
            setPageState("Active");
            startClock();
          } else {
            setPageState("FinishProfile");
          }

        }
        return;
      }
      setPageState("Unauthenticated");

    }

    onLoad();

  }, [])

  const handleLoginOrSignup = async () => {
    if (phoneNumber.length < 9) {
      console.log('short');
      return;
    }

    const response = await loginOrSignup(phoneNumber);

    if (response.message === 'Verification code sent successfully') {
      setShowEnterAccessCode(true);
    }
  };

  const handleSubmitCode = async () => {
    if (verificationCode.length < 4) {
      return;
    }

    const response = await verifyCode(phoneNumber, verificationCode);

    if (response.message === 'Successful') {
      localStorage.setItem('token', response.token);
      setPageState("Active");
    }

  };

  const handleFinishProfile = async () => {
    if (myName.length < 0 || myProteinGoal.length < 0 || myCalorieGoal.length < 0 || myGangId.length < 0 ) {
      alert("Please fill in all fields");
      return;
    }

    const token = localStorage.getItem('token');

    const response = await finishProfile({ token: token, name: myName, meals: ["Breakfast, Lunch, Dinner"],
     calorieGoal: parseInt(myCalorieGoal), proteinGoal: parseInt(myProteinGoal), gangId: myGangId
    });

    if (response.message === "Success") {
      setPageState("Active");
      setUser(response?.user);
    }

  }

  const startClock = () => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(intervalId);
  };

  if (pageState === "Loading") return (
    <div className={`App p-4 min-h-lvh bg-black`}>
      <h4 className="text-xl mt-40 mb-2 text-white font-semibold">Loading</h4>
    </div>
  )

  if (pageState === "Unauthenticated") return (
    <div className={`App p-4 min-h-lvh bg-black ${showEnterAccessCode ? 'show-verification' : ''}`}>
      <h4 className="text-5xl mb-2 text-white font-semibold">Zac's Cals</h4>
      <h2 className="text-xs text-white font-semibold">{`Basically a calorie tracker with your boys`}</h2>

      <div className="mt-8">
        <div
          className={`input-container ${showEnterAccessCode ? 'animate-fade-out opacity-0' : 'animate-fade-in opacity-100'}`}
        >
          <input
            placeholder="(905) 505-1134"
            className="rounded-lg mt-2 p-2"
            value={phoneNumber}
            type="number"
            onChange={(e) => {
              setPhoneNumber(e.target.value);
            }}
          ></input>
        </div>

        {showEnterAccessCode && (
          <div
            className={`input-container ${showEnterAccessCode ? 'animate-fade-in opacity-100' : 'animate-fade-out opacity-0'}`}
          >
            <input
              placeholder="Verification code (e.g 2715)"
              className="rounded-lg mt-2 p-2"
              value={verificationCode}
              type="number"
              onChange={(e) => {
                setVerificationCode(e.target.value);
              }}
            ></input>
          </div>
        )}

        {!showEnterAccessCode && <button onClick={handleLoginOrSignup} className="rounded-lg w-1/2 p-2 bg-white shadow-lg shadow-orange-200 mt-8">
          <h3>Signup / Login</h3>
        </button>}
        {showEnterAccessCode && <button onClick={handleSubmitCode} className="rounded-lg p-2 bg-white shadow-lg shadow-orange-200 mt-8">
          <h3>Submit code</h3>
        </button>}
        {showEnterAccessCode && <div><button className="rounded-lg p-2 mt-2">
          <h3 className="text-orange-300 underline text-xs mt-4">Resend code</h3>
        </button></div>}
      </div>
    </div>
  );

  if (pageState==="FinishProfile")return (
    <div className={`App p-4 min-h-lvh bg-black ${showEnterAccessCode ? 'show-verification' : ''}`}>
      <h4 className="text-5xl mb-2 text-white font-semibold">Zac's Cals</h4>
      <h2 className="text-xs text-white font-semibold">{`Fill in your profile and you're good to go`}</h2>

      <div className="p-8 flex flex-col gap-2 shadow-lg shadow-orange-300 w-min mx-auto rounded-lg border-white border mt-8">
        <h1 className="text-white text-2xl mb-2 text-center font-bold">My Profile</h1>
        <input
          placeholder="Your name"
          className="rounded-lg mt-2 p-2 transition-all duration-200 hover:scale-95 hover:bg-slate-100"
          value={myName}
          onChange={(e) => {
            setMyName(e.target.value);
          }}
        ></input>

        <input
          placeholder="Your daily protein goal"
          type="number"
          className="rounded-lg mt-2 p-2 transition-all duration-200 hover:scale-95 hover:bg-slate-100"
          value={myProteinGoal}
          onChange={(e) => {
            setMyProteinGoal(e.target.value);
          }}
        ></input>

        <input
          placeholder="Your daily calorie goal"
          className="rounded-lg mt-2 p-2 transition-all duration-200 hover:scale-95 hover:bg-slate-100"
          value={myCalorieGoal}
          onChange={(e) => {
            setMyCalorieGoal(e.target.value);
          }}
        ></input>

        <input
          placeholder="Your gang code (8 people per gang)"
          className="rounded-lg mt-2 p-2 transition-all duration-200 hover:scale-95 hover:bg-slate-100"
          value={myGangId}
          onChange={(e) => {
            setMyGangId(e.target.value);
          }}
        ></input>

        <button onClick={handleFinishProfile} className="rounded-lg transition-all duration-200 hover:bg-slate-200 hover:scale-95 w-full p-2 bg-white shadow-inner mt-4">
          <h3 className="font-semibold">Finish</h3>
        </button>


      </div>

    </div>
  );

  if (pageState==="Active") return (
    <div className={`App p-4 min-h-lvh bg-black ${showEnterAccessCode ? 'show-verification' : ''}`}>
      <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={100} />
      <h4 className="text-5xl mb-2 text-white font-semibold">Zac's Cals</h4>
      {/* <h2 className="text-xs text-white font-semibold">{`Make this super dope with colour`}</h2> */}
      {/* <h2 className="text-lg mt-8 text-white font-semibold">Welcome, {user?.name}</h2> */}
      {/* <h2 className={`text-sm mt-4 text-white font-semibold duration-200 transition-all ${currentTime ? 'opacity-100' : 'opacity-0'}`}>Life is short. Let's make it longer.</h2> */}
      <h2 className={`text-sm mt-4 text-white font-semibold mx-auto w-32 duration-200 transition-all ${currentTime ? 'opacity-100' : 'opacity-0'}`}>{currentTime}</h2>
      <h2 className="text-white">It's<span className={`text-2xl mt-4 text-orange-200 font-extrabold mx-auto w-32 duration-200 transition-all ${currentTime ? 'opacity-100' : 'opacity-0'}`}> Breakfast </span>Time</h2>

      <h4 className="text-white mt-10 mb-4">Your last 3 meals</h4>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 border border-white rounded-lg text-white">N/A</div>
        <div className="p-2 border border-white rounded-lg text-white">N/A</div>
        <div className="p-2 border border-white rounded-lg text-white">N/A</div>

      </div>

      <h4 className="text-white mt-10 mb-4">We'll text you next at 11:45 AM</h4>




    </div>
  );

  return (
    <div className={`App p-4 min-h-lvh bg-black ${showEnterAccessCode ? 'show-verification' : ''}`}>

    </div>
  )
}

export default App;
