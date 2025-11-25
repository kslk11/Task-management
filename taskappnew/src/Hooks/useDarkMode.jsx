import React, { useEffect, useState } from 'react'

const useDarkMode = (initialvalue=false) => {
  const[value,setValue]=useState(initialvalue)

  const toggle=()=>{
    setValue(!value)
  }
  return [value,toggle];
  }

export default useDarkMode