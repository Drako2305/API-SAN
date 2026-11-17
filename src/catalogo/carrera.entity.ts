import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { OfertaAcademica } from './oferta-academica.entity';

@Entity('carreras')
export class Carrera {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column({ type: 'varchar', nullable: true })
  imagenUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  area: string | null;

  @OneToMany(() => OfertaAcademica, (oferta) => oferta.carrera)
  ofertas: Relation<OfertaAcademica[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  fechaRegistro: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  fechaActualizacion: Date;
}
