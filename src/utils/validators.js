
export const emailValidator = (email) => {
  const re = /\S+@\S+\.\S+/; 
  
  if (!email) return "O e-mail não pode estar vazio.";
  if (!re.test(email)) return "Ooops! Precisamos de um e-mail válido.";
  
  return ""; 
};

export const passwordValidator = (password) => {
  if (!password) return "A senha não pode estar vazia.";
  if (password.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
  
  return ""; 
};