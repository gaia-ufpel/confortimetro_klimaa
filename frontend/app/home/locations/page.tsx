"use client";
import React, {useState} from 'react'


interface Location {
  id: number;
  campus: string;
  building: string;
  room: string;
}

const Locations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  return (
    <div>

    </div>
  )
}

export default Locations