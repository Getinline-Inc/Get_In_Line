import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  auth,
  registerWithEmailAndPassword,
  signInWithGoogle,
} from "../Firebase";
import "./register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const register = async () => {
    var validationCode = validate();
    if (validationCode === 1) {
      alert("Please enter name.");
    } else if (validationCode === 2) {
      alert("Please enter a valid email.");
    } else if (validationCode === 3) {
      alert("Please enter a password.");
    } else {
      try {
        await registerWithEmailAndPassword(name, email, password, false);
        navigate("/login");
      } catch (e) {
        console.error(e);
        alert(e.message);
      }
    }
  };

  useEffect(() => {
    if (loading) return;
  }, [user, loading]);

  return (
    <div className="register">
      <div className="register__container">
        <input
          type="text"
          className="register__textBox"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
        />
        <input
          type="text"
          className="register__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />
        <input
          type="password"
          className="register__textBox"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="register__btn" onClick={register}>
          Register
        </button>
        <button
          className="register__btn register__google"
          onClick={signInWithGoogle}
        >
          Register with Google
        </button>
        <div>
          Already have an account? <Link to="/">Login</Link> now.
        </div>
      </div>
    </div>
  );

  function validate() {
    if (!name) {
      return 1;
    }
    if (!isEmail(email)) {
      return 2;
    }
    if (!password) {
      return 3;
    }
  }

  function isEmail(string) {
    var matcher = /^[a-zA-Z0-9.!#$%&'*+\/?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return matcher.test(string);
  }
}
export default Register;
