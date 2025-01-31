import Google from "../images/google.png";
import { Link } from "react-router-dom";
import React from "react";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {useSignIn} from "react-auth-kit"
import axios from "../api/axios";
const Login = ({ sendUserToApp }) => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const userRef = useRef();
  const errRef = useRef();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const signIn = useSignIn();
  useEffect(() => {
    userRef.current.focus();
  }, []);
  useEffect(() => {
    setErrMsg("");
  }, [email, password]);

  // const navigate = useNavigate();

  const submit = async () => {
    console.log(email);
    console.log(password);
    try {
      const response = await axios.post(
        "/login",
        JSON.stringify({ email: email, password: password }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log(response.data.user.firstName)
      const {username, firstName, lastName, role,company} = response.data.user
      signIn({
        token: response.data.token,
        expiresIn: 60* 15,//15 mins
        tokenType:"Bearer",
        authState: {username,firstName, lastName, email, company, role} //info about the user
      });
      setEmail("");
      setPassword("");
      setSuccess(true);
      localStorage.setItem("userID", response?.data.user?.id);
      setUser(response?.data.user)
      handleSendUser(response?.data.user)
      navigate("/home");

    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg("Missing Username or Password");
      } else if (err.response?.status === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
      errRef.current.focus();
    }
  };
  const handleSendUser = (data) => {
    const { ...newData } = data;
    const userToSend = {
      ...newData,
      displayName: newData.firstName + " " + newData.lastName,
    };
    sendUserToApp(userToSend);
  };
  const google = async () => {
     window.open("http://localhost:3001/auth/google", "_self");

  };

  const signUp = () => {
    navigate("../Signup");
  };

  return (
    <div>
      {success ? (
        <section>
          <h1>You are logged in!</h1>
          <br />
          <p>
            <a href="#">Go to Home</a>
          </p>
        </section>
      ) : (
        <div className="login">
          <h1 className="loginTitle">Choose a Login Method</h1>
          <div className="wrapper">
            <div className="left">
              <div className="loginButton google" onClick={google}>
                <img src={Google} alt="Google icon" className="icon" />
                Google
              </div>
              <div className="loginButton github center" onClick={signUp}>
                Sign Up
              </div>
            </div>
            <div className="center">
              <div className="line" />
              <div className="or">OR</div>
            </div>
            <div className="right">
              <p
                ref={errRef}
                className={errMsg ? "errmsg" : "offscreen"}
                aria-live="assertive"
              >
                {errMsg}
              </p>

              <input
                type="email"
                placeholder="Enter email"
                ref={userRef}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
              <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <button className="submit" onClick={submit}>
                Login
              </button>
              <Link className="link" to="../forgotPassword">
                Forgot Password?
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
