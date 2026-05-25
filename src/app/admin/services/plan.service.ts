import { inject, Injectable } from '@angular/core';

import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Plan } from '../models/plan';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private firestore = inject(Firestore);
  private plansRef = collection(this.firestore, 'plans');

  createPlan(plan: Plan) {
    return addDoc(this.plansRef, {
      ...plan,
      createdAt: new Date(),
    });
  }

  getPlans(): Observable<Plan[]> {
    return collectionData(this.plansRef, {
      idField: 'id',
    }) as Observable<Plan[]>;
  }

  updatePlan(id: string, data: Partial<Plan>) {
    const planDoc = doc(this.firestore, `plans/${id}`);
    return updateDoc(planDoc, data);
  }

  deletePlan(id: string) {
    const planDoc = doc(this.firestore, `plans/${id}`);
    return deleteDoc(planDoc);
  }
}
