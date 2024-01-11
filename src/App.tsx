import React, { useState, useEffect } from 'react';
import './App.css';
import { loginOrSignup, verifyCode, authenticateToken, finishProfile, deleteMeal } from './api/index';
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
  const [recentMeals, setRecentMeals] = useState([]);
  const [threeGangs, setThreeGangs] = useState([]);

  const mealsEaten = [];

  const onLoad = async () => {

    const localToken = await localStorage.getItem('token');
    if (localToken) {
      const response = await authenticateToken(localToken);
      if (response.user) {
        setUser(response?.user);
        if (response?.user.isComplete === true) {
          setRecentMeals(response?.recentMeals);
          console.log('ltm are', response?.recentMeals);
          setPageState("Active");
          startClock();
        } else {
          setPageState("FinishProfile");
        }

      } else {
        setPageState('Unauthenticated');
        localStorage.removeItem('token');
      }
      return;
    }
    setPageState("Unauthenticated");

  }

  useEffect(() => {

    

    onLoad();

  }, [])

    // Helper function to format date into a day string
  const getDayString = (date: any) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Function to restructure meals data
  const structureMealsData = (meals: any) => {
    return meals.reduce((acc: any, meal: any) => {
      const mealDay = getDayString(new Date(meal.timeEaten));
      if (!acc[mealDay]) {
        acc[mealDay] = {};
      }
      if (!acc[mealDay][meal.mealType]) {
        acc[mealDay][meal.mealType] = [];
      }
      acc[mealDay][meal.mealType].push(meal);
      return acc;
    }, {});
  };

  useEffect(() => {
    if (recentMeals.length) {
      setStructuredMeals(structureMealsData(recentMeals));
    }
  }, [recentMeals]);

  const [structuredMeals, setStructuredMeals] = useState<any>({});

  function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
  
    // Function to format the date as AM/PM
    const formatAMPM = (date: Date): string => {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // hour '0' should be '12'
      
      // Create a formatted string for minutes
      const formattedMinutes = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
  
      return hours + ':' + formattedMinutes + ' ' + ampm;
    }
  
    // Function to check if the date is today
    const isToday = (someDate: Date) => {
      const today = new Date();
      return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
    }
  
    // Check if the date is today
    if (isToday(date)) {
        return formatAMPM(date); // Return time in AM/PM format
    } else {
        // Calculate the difference in days
        const diffTime = Math.abs(now.setHours(0,0,0,0) - date.setHours(0,0,0,0));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} day(s) ago`;
    }
  }
  



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
      onLoad();
    } else if (response.message === 'FinishProfile') {
      localStorage.setItem('token', response.token);
      if (response?.threeGangs) {setThreeGangs(response?.threeGangs);}
      setPageState("FinishProfile");
    }

  };

  const handleDeleteMeal = async (mealId: string) => {

    const localToken = await localStorage.getItem('token');

    if (!localToken) {
      alert("error you're not authenticated")
      return;
    }

    const resp = await deleteMeal(localToken, mealId);

    if (resp?.message === "Meal successfully deleted") {
      // Update the recentMeals state to exclude the deleted meal
      const updatedMeals = recentMeals.filter((meal: any) => meal._id !== mealId);
      setRecentMeals(updatedMeals);
      alert("Meal deleted successfully.");
    } else {
      // Handle any error messages
      alert("Error: Could not delete the meal.");
    }


  }

  const handleFinishProfile = async () => {
    if (myName.length < 0 || myProteinGoal.length < 0 || myCalorieGoal.length < 0 || myGangId === '' ) {
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
      <h4 className="text-5xl mb-2 text-white font-semibold">{user?.name || "Zac"}'s Cals</h4>
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

        {!showEnterAccessCode && <button onClick={handleLoginOrSignup} className="rounded-lg w-1/2 p-2 bg-white shadow-lg transition duration-200 hover:bg-gray-200 hover:scale-95 shadow-orange-200 hover:shadow-orange-300 mt-8">
          <h3>Signup / Login</h3>
        </button>}
        {showEnterAccessCode && <button onClick={handleSubmitCode} className="rounded-lg p-2 bg-white shadow-lg transition duration-200 hover:bg-gray-200 hover:scale-95 shadow-orange-200 mt-8">
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


      </div>

      <h1 className="text-white text-2xl mb-2 text-center font-bold mt-8">Pick your gang</h1>


      <div className="gang-container p-2 grid grid-cols-2">
        {threeGangs.map((gang: any) => (
          <div onClick={()=>{setMyGangId(gang?._id)}} className={`${myGangId===gang._id ? 'border-yellow-300 font-bold border-2 shadow-orange-300 shadow-md' : ''} p-8 flex flex-col gap-2 shadow-lg w-min mx-auto rounded-lg transition-all duration-200 hover:scale-95 border-white border mt-8`}>
            <h2 className="text-white">{gang?.gangName}</h2>
          </div>
        ))

        }
        <div onClick={()=>{setMyGangId("NEW_GANG")}} className={`${myGangId==="NEW_GANG" ? 'border-yellow-300 font-bold border-2 shadow-orange-300 shadow-md' : ''} transition-all duration-200 hover:scale-95 cursor-pointer p-8 flex flex-col gap-2 shadow-lg w-min mx-auto rounded-lg border-white border mt-8`}>
          <h2 className="text-white">Create new gang</h2>
        </div>
      
          
      </div>


      <button onClick={handleFinishProfile} className="rounded-lg w-32 transition-all duration-200 hover:bg-slate-200 hover:scale-95 p-2 bg-white shadow-inner mt-4">
          <h3 className="font-semibold">Finish</h3>
      </button>

    </div>
  );

  const renderMeals = () => {
    return Object.keys(structuredMeals).map(day => {
      // Initialize total calories and protein counters for each day
      let totalCalories = 0;
      let totalProtein = 0;
  
      // Calculate total calories and protein for each day
      Object.keys(structuredMeals[day]).forEach(mealType => {
        structuredMeals[day][mealType].forEach((meal: any) => {
          totalCalories += meal.calories;
          totalProtein += meal.protein;
        });
      });
  
      return (
        <div key={day} className="flex flex-col p-1 rounded-lg my-2 text-white">
          <h3 className="text-2xl mt-4 text-orange-200 font-extrabold mx-auto w-32 duration-200 transition-all">{day}</h3>
  
          {/* Display the total calories and protein for the day */}
          <div className="day-totals">
            <p>Total Calories: {totalCalories}</p>
            <p>Total Protein: {totalProtein}g</p>
          </div>
  
          {Object.keys(structuredMeals[day]).map(mealType => (
            <div key={mealType} className="p-2 border border-gray-400 rounded-xl m-2">
              <h4 className="text-xl font-semibold my-2">{mealType}</h4>
              {structuredMeals[day][mealType].map((meal: any) => (
                <div key={meal.id} className="meal-item">
                  <p>{meal.calories} calories</p>
                  <p>{meal.protein}g of protein</p>
                  <p className="my-1 px-4">{meal?.submittedString}</p>
                  <p>{formatTimestamp(meal.timeEaten)}</p>
                  <p onClick={()=>{handleDeleteMeal(meal._id)}} className="text-xs cursor-pointer text-red-200 mt-4 underline">Delete Meal</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    });
  };
  

  if (pageState==="Active") return (
    <div className={`App p-4 min-h-lvh bg-black ${showEnterAccessCode ? 'show-verification' : ''}`}>
      <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={100} />
      <h4 className="text-5xl mb-2 text-white font-semibold">Zac's Cals</h4>
      {/* <h2 className="text-xs text-white font-semibold">{`Make this super dope with colour`}</h2> */}
      {/* <h2 className="text-lg mt-8 text-white font-semibold">Welcome, {user?.name}</h2> */}
      {/* <h2 className={`text-sm mt-4 text-white font-semibold duration-200 transition-all ${currentTime ? 'opacity-100' : 'opacity-0'}`}>Life is short. Let's make it longer.</h2> */}
      <h2 className={`text-sm mt-4 text-white font-semibold mx-auto w-32 duration-200 transition-all ${currentTime ? 'opacity-100' : 'opacity-0'}`}>{currentTime}</h2>
      {/* <h2 className="text-white">It's<span className={`text-2xl mt-4 text-orange-200 font-extrabold mx-auto w-32 duration-200 transition-all ${currentTime ? 'opacity-100' : 'opacity-0'}`}> Breakfast </span>Time</h2> */}


      <h4 className="text-white mt-10 mb-4">Your recent meals</h4>
      {renderMeals()}

      {/* <h4 className="text-white mt-10 mb-4">We'll text you next at 11:45 AM</h4> */}

      <h4 className="text-white mt-10 mb-4">Your gang</h4>



    </div>
  );

  return (
    <div className={`App p-4 min-h-lvh bg-black ${showEnterAccessCode ? 'show-verification' : ''}`}>

    </div>
  )
}

export default App;
