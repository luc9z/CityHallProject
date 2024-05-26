import { useState, useContext } from "react";
import profileImg from "../../assets/pics/profile-default.png";
import styles from "./style.module.scss";
import useBreakpoint from "../../hooks/useBreakPoint";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { storage } from "../../services/firebaseConnection";
import { ref, uploadBytes } from "firebase/storage";
import { AuthContext } from "../../contexts/AuthContext";
import InputMask from 'react-input-mask';


export default function Login() {
  const { phone, desktop } = useBreakpoint();
  const [showPassword, setShowPassword] = useState(false);
  const [formType, setFormType] = useState(); //define se o tipo de formulário é de login ou register
  const [initial, setInitial] = useState(true);

  const { signIn, signUp, loadingAuth } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const navigate = useNavigate();

  function handlePage(type) {
    setInitial(false);
    setFormType(type);
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setEmail("");
    setPassword("");
    setConfirmPass("");
    setProfilePhoto(null);
    setShowPassword(false);
  }

  function handleProfilePhotoChange(event) {
    const file = event.target.files[0];
    setProfileFile(file);
    const reader = new FileReader();

    reader.onloadend = () => {
      setProfilePhoto(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  const handlePhoneInput = (event) => {
    setPhoneNumber(event.target.value);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (formType === "register") {
      if (
        firstName !== "" &&
        lastName !== "" &&
        phoneNumber &&
        email !== "" &&
        password !== "" &&
        confirmPass !== ""
      ) {
        if (validPhone(phoneNumber)) {
          if (validPassword(password)) {
            if (password === confirmPass) {
              await signUp(
                capitalize(firstName),
                capitalize(lastName),
                phoneNumber,
                profilePhoto,
                email,
                password
              );
              if (profileFile) {
                const storageRef = ref(storage, `/userImgs/${email}`);
                uploadBytes(storageRef, profileFile).then((snapshot) => {
                  console.log("Uploaded a blob or file!");
                });
              }
            } else {
              toast.error("Passwords don't match!");
              setConfirmPass("");
            }
          } else {
            toast.error(
              "The password must containt 6 characters, a special character, a number and a uppercase"
            );
            setPassword("");
            setConfirmPass("");
          }
        } else {
          toast.error("Invalid phone number");
          setPhoneNumber("");
        }
      } else {
        toast.error("All fields must be filled");
      }
    } else if (formType === "login") {
      if (email !== "" && password !== "") {
        try {
          await signIn(email, password);
        } catch (error) {
          // toast.error já foi chamado no AuthContext
        }
      } else {
        toast.error("All fields must be filled");
      }
    }
  }

  function validPassword(senha) {
    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*\d)(?=.*[A-Z]).{6,}$/;
    return passwordRegex.test(senha);
  }

  function validPhone(phoneNum) {
    const phoneRegex = /^\(\d{2}\) 9\d{4}-\d{4}$/;
    return phoneRegex.test(phoneNum);
  }

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  return (
    <>
      {initial ? (
        <>
          {phone ? (
            <div className={styles.initialScreen}>
              <div className={styles.fade}></div>
              <div className={styles.initialContent}>
              <h1>The schedule you need.</h1>
                <button
                  onClick={() => handlePage("register")}
                  className="title-regular"
                >
                  Get Started
                </button>
                <span
                  onClick={() => handlePage("login")}
                  className="title-regular text-high-emphasis"
                >
                  I already have an account
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.initialScreen}>
              <div className={styles.initialContent}>
                <h1>The schedule you need.</h1>
                <button
                  onClick={() => handlePage("register")}
                  className="title-regular"
                >
                  Get Started
                </button>
                <span
                  onClick={() => handlePage("login")}
                  className="title-regular text-high-emphasis"
                >
                  I already have an account
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.content}>
          <div className={styles.container}>
            <div className={styles.title}>
              <h1 className={desktop ? "display-medium" : "display-small"}>
                {formType === "register" ? "Welcome" : "Welcome Back"}
              </h1>
              <span className="body-medium">
                Put your credentials to{" "}
                {formType === "register"
                  ? "create your account."
                  : "login"}
              </span>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
              {formType === "register" && (
                <>
                  <div>
                    <label htmlFor="profilePhotoInput">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          className={styles.profilePhoto}
                        />
                      ) : (
                        <img src={profileImg} className={styles.profilePhoto} />
                      )}
                    </label>
                    <input
                      type="file"
                      id="profilePhotoInput"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className={styles.inputContainer}>
                    <div className={styles.inputField}>
                      {desktop && <label>First Name</label>}
                      <input
                        type="text"
                        className="body-medium text-primary"
                        placeholder={`${phone ? "First Name" : ""}`}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    <div className={styles.inputField}>
                      {desktop && <label>Last Name</label>}
                      <input
                        type="text"
                        className="body-medium text-primary"
                        placeholder={`${phone ? "Last Name" : ""}`}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className={styles.inputContainer}>
                <div className={styles.inputField}>
                  {desktop && <label>Email</label>}
                  <input
                    type="text"
                    className="body-medium text-primary"
                    placeholder={`${phone ? "Email" : ""}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {formType === "register" && (
                  <div className={styles.inputField}>
                    {desktop && <label>Phone Number</label>}
                    <InputMask
                      mask="(99) 99999-9999"
                      value={phoneNumber}
                      onChange={handlePhoneInput}
                      className="body-medium text-primary"
                      placeholder={phoneNumber ? "Phone Number" : ""}
                    >
                      {(inputProps) => <input {...inputProps} type="tel" />}
                    </InputMask>
                  </div>
                )}
              </div>
              <div className={styles.inputContainer}>
                <div className={styles.inputField}>
                  {desktop && <label>Password</label>}
                  <input
                    type={showPassword ? "text" : "password"}
                    className="body-medium text-primary"
                    placeholder={`${phone ? "Password" : ""}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {!showPassword ? (
                    <BsEye style={{}} size={20} onClick={() => setShowPassword(true)} />
                  ) : (
                    <BsEyeSlash
                      style={{}}
                      size={20}
                      onClick={() => setShowPassword(false)}
                    />
                  )}
                </div>

                {formType === "register" && (
                  <div className={styles.inputField}>
                    {desktop && <label>Confirm your Password</label>}
                    <input
                      type={showPassword ? "text" : "password"}
                      className="body-medium text-primary"
                      placeholder={`${phone ? "Confirm your Password" : ""}`}
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <button type="submit" className="display-small">
                {loadingAuth
                  ? "Loading..."
                  : `${formType === "register" ? "Register" : "Login"}`}
              </button>
            </form>
          </div>
          <span className={styles.changeType}>
            {formType === "register" ? (
              <p>
                Already have an account?{" "}
                <span onClick={() => handlePage("login")}>Click Here</span>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <span onClick={() => handlePage("register")}>Register Now</span>
              </p>
            )}
          </span>
        </div>
      )}
    </>
  );
}
