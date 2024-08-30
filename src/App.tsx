import { useState, useEffect } from "react";  
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  ClockIcon,
  PlusIcon,
  PillIcon,
  CalculatorIcon,
  ListIcon,
  TrashIcon,
  CalendarIcon,
} from "lucide-react";



type Medicines = {
  name: string;
  interval: number;
  id: string;
};

export default function App() {
  const [currentTime, setCurrentTime] = useState("");
  const [medicines, setMedicines] = useState<Medicines[]>(() => {
    const savedMedicines = localStorage.getItem("medicines");
    return savedMedicines ? JSON.parse(savedMedicines) : [];
  });
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isSpecificTime, setIsSpecificTime] = useState(false);
  const [specificTime, setSpecificTime] = useState("");
  const [result, setResult] = useState("");
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newMedicineInterval, setNewMedicineInterval] = useState("");
  const [todaysMedicines, setTodaysMedicines] = useState<
    { id: string; name: string; interval: number; nextDose: Date }[]
  >(() => {
    const savedMedicines = localStorage.getItem("medicines-for-today");
    return savedMedicines ? JSON.parse(savedMedicines) : [];
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMedicineForToday, setSelectedMedicineForToday] = useState<
  { id: string; name: string; interval: number }
   | null>(null)
  useEffect(() => {
    localStorage.setItem("medicines", JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem("medicines-for-today", JSON.stringify(todaysMedicines));
  }, [todaysMedicines]);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTime = () => {
    const startTime = isSpecificTime
      ? new Date(`2000/01/01 ${specificTime}`)
      : new Date();
    const futureTime = new Date(
      startTime.getTime() +
        parseInt(hours) * 60 * 60 * 1000 +
        parseInt(minutes) * 60 * 1000,
    );
    setResult(
      futureTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );
  };

  const handleMedicineSelect = (value: string) => {
    setSelectedMedicine(value);
    const medicine = medicines?.find((m) => m.name === value);
    if (medicine) {
      setHours(medicine.interval.toString());
      setMinutes("0");
    }
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const addCustomMedicine = () => {
    if (newMedicineName && newMedicineInterval) {
      setMedicines([
        ...medicines,
        { id:crypto.randomUUID(), name: newMedicineName, interval: parseInt(newMedicineInterval) },
      ]);

      setNewMedicineName("");
      setNewMedicineInterval("");
    }
  };
  const openAddToTodayDialog = (medicine: { id: string; name: string; interval: number;  }) => {
    setSelectedMedicineForToday(medicine)
    setIsDialogOpen(true)
  }

  const addToTodaysMedicines = () => {
    if (selectedMedicineForToday) {

      const nextDose = new Date(Date.now() + selectedMedicineForToday.interval * 60 * 60 * 1000);

      const todayMedicine = {
        id: crypto.randomUUID(),
        name: selectedMedicineForToday.name,
        interval: selectedMedicineForToday.interval,
        nextDose
      };
      setTodaysMedicines([...todaysMedicines, todayMedicine]);
      setIsDialogOpen(false)
    }
  }
  useEffect(() => {
    const now = new Date()
    setTodaysMedicines(prevMedicines => 
      prevMedicines.filter(med => new Date(med.nextDose) > now)
    )
  }, [currentTime])

  const removeTodaysMedicine = (id: string) => {
    setTodaysMedicines(todaysMedicines.filter((m) => m.id !== id));
  };
  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 shadow-xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200">
            Medicine Timer
          </h2>
          <div className="text-right">
            <p className="text-sm text-purple-600 dark:text-purple-300">
              Current Time
            </p>
            <p className="text-lg font-semibold text-purple-800 dark:text-purple-100">
              {currentTime}
            </p>
          </div>
        </div>

        <Tabs defaultValue="calculate" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculate">
              <CalculatorIcon className="w-4 h-4 mr-2" />
              Calculate
            </TabsTrigger>
            <TabsTrigger value="medicines">
              <PillIcon className="w-4 h-4 mr-2" />
              Medicines
            </TabsTrigger>
            <TabsTrigger value="custom">
              <ListIcon className="w-4 h-4 mr-2" />
              Add Custom
            </TabsTrigger>
            <TabsTrigger value="today"><CalendarIcon className="w-4 h-4 mr-2" />Today</TabsTrigger>
          </TabsList>

          <TabsContent value="calculate" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicine-select">Select Medicine:</Label>
              <Select
                onValueChange={handleMedicineSelect}
                value={selectedMedicine}
              >
                <SelectTrigger
                  id="medicine-select"
                  className="bg-white dark:bg-gray-800"
                >
                  <SelectValue placeholder="Choose a medicine" />
                </SelectTrigger>
                <SelectContent>
                  {medicines?.map((medicine) => (
                    <SelectItem key={medicine.name} value={medicine.name}>
                      {medicine.name} (every {medicine.interval} hours)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="specific-time"
                checked={isSpecificTime}
                onCheckedChange={setIsSpecificTime}
              />
              <Label htmlFor="specific-time">Use specific start time</Label>
            </div>

            {isSpecificTime && (
              <div className="space-y-2">
                <Label htmlFor="specific-time-input">Start Time:</Label>
                <Input
                  id="specific-time-input"
                  type="time"
                  
                  value={specificTime}
                  onChange={(e) => setSpecificTime(e.target.value)}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            )}

            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="hours">Hours:</Label>
                <Input
                  id="hours"
                  type="number"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="minutes">Minutes:</Label>
                <Input
                  id="minutes"
                  type="number"
                  placeholder="0"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <Button
              onClick={calculateTime}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Calculate Next Dose
            </Button>

            {result && (
              <div className="mt-6 text-center animate-fade-in">
                <div className="inline-block p-6 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                  <ClockIcon className="w-16 h-16 text-purple-600 dark:text-purple-400 animate-pulse" />
                </div>
                <div className="mt-4">
                  <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                    Next dose at:
                  </p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                    {result}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="today" className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Today's Medicines</h3>
            {todaysMedicines?.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">No medicines scheduled for today</p>
            ) : (
              <ul className="space-y-2">
                {todaysMedicines?.map((medicine, index) => {

                  return (
                    <li key={index} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-md">
                      <span>{medicine.name}</span>
                      <span className="text-sm text-purple-600 dark:text-purple-400">

                        Next dose: {new Date(medicine?.nextDose).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button onClick={() => removeTodaysMedicine(medicine.id)} className="text-purple-600 dark:text-purple-400 text-sm">
              <TrashIcon className="w-4 h-4 mr-2" />
            </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </TabsContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Medicine to Today's Schedule</DialogTitle>
              <DialogDescription>
                Do you want to add {selectedMedicineForToday?.name} to your schedule for today?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={addToTodaysMedicines}>Add to Today</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          <TabsContent value="medicines" className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
              Medicine List
            </h3>
            <ul className="space-y-2">
              {medicines?.map((medicine) => (
                <li
                onClick={() => openAddToTodayDialog(medicine)}
                  key={medicine.name}
                  className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-md cursor-pointer hover:bg-purple-100"
                >
                  <span>{medicine.name}</span>
                  <span className="text-sm text-purple-600 dark:text-purple-400">
                    Every {medicine.interval} hours
                  </span>
            <button onClick={() => removeMedicine(medicine.id)} className="text-purple-600 dark:text-purple-400 text-sm">
              <TrashIcon className="w-4 h-4 mr-2" />
            </button>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
              Add Custom Medicine
            </h3>
            <div className="space-y-2">
              <Input
                placeholder="Medicine name"
                value={newMedicineName}
                onChange={(e) => setNewMedicineName(e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
              <Input
                type="number"
                placeholder="Interval (hours)"
                value={newMedicineInterval}
                onChange={(e) => setNewMedicineInterval(e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
              <Button
                onClick={addCustomMedicine}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <PlusIcon className="h-4 w-4 mr-2" /> Add Medicine
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
