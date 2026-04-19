import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';


const Login = () => {
	return (
		<>
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
							<form action="">
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
									<div>
										<a className="link link-hover">
											Forgot password?
										</a>
									</div>
                                    <div>
										<a className="link link-hover">
											Register as New User!
										</a>
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
