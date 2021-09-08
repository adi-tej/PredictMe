function IsEmail(email) {
  /*
	 * Below regular expression tests for validity of entered email. Explained below
	 * [^<>()[\]\\.,;:\s@\"]                                -> The first character of the email address cannot be any of <>()[]\.,;:\s@"
	 * \.[^<>()[\]\\.,;:\s@\"]                              -> after a "." character the next character cannot be any of <>()[]\.,;:\s@"
	 * @                                                    -> matches the "@" character
	 * (\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]) -> after the "@" character it can be either an ip address or
	 * (([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))                   -> after the "@" character there should be at-least a "." character followed by 2 or more alphabets  
	 */ 
	var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return reg.test(email);
}

