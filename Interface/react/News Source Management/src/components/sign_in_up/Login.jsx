
import { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';
import api from '../../tools/axios';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { saveLocal } from '../../tools/localTools';
import { UserContext } from '../../UserContext';
import { loadLocal } from '../../tools/localTools';


const Login = () => {

    const [formData, setFormData] = useState({email: '', password: ''});
	const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
	const {isLoggedIn, setIsLoggedIn, userData, setUserData} = useContext(UserContext);

    const handleLogin = async (e) => {
        e.preventDefault(); 

        try {
            
            const response = await api.post('/signin', formData);

			// 1. Getting the token and user data
			const {token, user} = response.data.data;

            // 2. Save it to LocalStorage
            saveLocal('token', token);
			saveLocal('user', user);
			saveLocal('rememberMe', rememberMe);
			if (!rememberMe) {
				sessionStorage.setItem('session_active', 'true');
			}

            toast.success(response.data.msg);

			// loading the token into context
			setIsLoggedIn(true);
			setUserData(user);

            // 3. Redirect or update UI state
            navigate('/', {viewTransition: true});

        } catch (error) {
            toast.error(error.response?.data?.msg || "Something went wrong!");
            console.log(error);
        }
    }

	return (
		<>
            <Toaster position='top-center'/>
			<div className="hero bg-base-200 min-h-screen">
				<div className="hero-content flex-col lg:flex-row-reverse">
					<div className="text-center lg:text-left">
						<h1 className="text-5xl font-bold">
							News Source Management
						</h1>
						<h3 className='font-bold text-2xl'>Get News From Different Sources</h3>
						<p className="py-4">
							A simple web application in order get news from
							differnet sources
						</p>
					</div>
					<div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
						<div className="card-body">
							<form onSubmit={handleLogin}>
								<fieldset className="fieldset">
									<label className="label">Email</label>
									<label className="input validator">
										<FontAwesomeIcon
											icon={faEnvelope}
											className="h-[1em] opacity-50"
										/>
										<input
											type="email"
											placeholder="mail@site.com"
											required
                                            onChange={e => {setFormData({...formData, email: e.target.value});}}
										/>
									</label>
									<div className="validator-hint hidden">
										Enter valid email address
									</div>

									<label className="label">Password</label>
									<label className="input validator">
										<FontAwesomeIcon
											icon={faKey}
											className="h-[1em] opacity-50"
										/>
										<input
											type="password"
											required
											placeholder="Password"
											minLength="8"
											pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
											title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                                            onChange={e => {setFormData({...formData, password: e.target.value})}}
										/>
									</label>
									<p className="validator-hint hidden">
										Must be more than 8 characters,
										including
										<br />
										At least one number <br />
										At least one lowercase letter <br />
										At least one uppercase letter
									</p>
									<label className='label'>
										Stay Logged in
										<input type="checkbox" onChange={e => setRememberMe(e.target.checked)} defaultChecked={loadLocal('rememberMe')}/>
									</label>
									<div>
										<Link className="link link-hover" to='/forgot-password' viewTransition={true}>
											Forgot password?
										</Link>
									</div>
                                    <div>
										<Link className="link link-hover" to='/register' viewTransition={true}>
											No account? Sign up here
										</Link>
									</div>
									<input type='submit' value='Log in' className="btn btn-neutral mt-4"/>
								</fieldset>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
