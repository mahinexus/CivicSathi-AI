export function matchSchemes(profile, schemes) {
  const age = Number(profile.age), income = Number(profile.income);
  const hasAge = profile.age !== undefined && profile.age !== '' && !isNaN(age);
  const hasInc = profile.income !== undefined && profile.income !== '' && !isNaN(income);
  return schemes.filter((s) =>
    (!hasAge || (age >= s.minAge && age <= s.maxAge)) &&
    (!hasInc || income <= s.maxIncome) &&
    (!s.gender || !profile.gender || s.gender === profile.gender) &&
    (s.occupations.includes('any') || !profile.occupation || s.occupations.includes(profile.occupation))
  );
}
